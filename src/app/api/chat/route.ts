import { NextRequest, NextResponse } from 'next/server';
import { OLLAMA_MODELS, isValidModel, DEFAULT_MODEL } from '@/lib/ollama-models';

// POST /api/chat - Unified chat proxy for all providers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, model, messages, temperature = 0.7, apiKey } = body;

    // 1. Validate provider
    if (!provider || !['gemini', 'claude', 'ollama'].includes(provider)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_PROVIDER', message: 'Provider tidak valid' },
        { status: 400 }
      );
    }

    // 2. Validate messages array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'INVALID_MESSAGES', message: 'Pesan tidak valid' },
        { status: 400 }
      );
    }

    // 3. Validate message content (FIX: added content validation)
    for (const msg of messages) {
      if (typeof msg.content !== 'string') {
        return NextResponse.json(
          { success: false, error: 'INVALID_MESSAGES', message: 'Format pesan tidak valid' },
          { status: 400 }
        );
      }
    }

    // 4. Clamp temperature to safe range (FIX: bounded)
    const safeTemp = Math.max(0, Math.min(2, Number(temperature) || 0.7));

    // 5. For Ollama, validate model BEFORE checking API key (FIX: correct order)
    if (provider === 'ollama') {
      const modelToUse = model || DEFAULT_MODEL;
      if (!isValidModel(modelToUse)) {
        return NextResponse.json(
          { success: false, error: 'MODEL_NOT_FOUND', message: `Model "${modelToUse}" tidak tersedia` },
          { status: 400 }
        );
      }
      return handleOllamaChat(modelToUse, messages, safeTemp);
    }

    // 6. Route Gemini / Claude
    switch (provider) {
      case 'gemini':
        return handleGeminiChat(apiKey, model || 'gemini-2.0-flash', messages, safeTemp);
      case 'claude':
        return handleClaudeChat(apiKey, model || 'claude-sonnet-4-20250514', messages, safeTemp);
      default:
        return NextResponse.json(
          { success: false, error: 'UNKNOWN_PROVIDER', message: 'Provider tidak dikenali' },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error('Chat API Error:', err);
    return NextResponse.json(
      { success: false, error: 'SERVER_ERROR', message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}

// =====================
// Ollama Cloud Handler
// =====================
async function handleOllamaChat(
  model: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number
) {
  const apiKey = process.env.OLLAMA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'API_KEY_MISSING', message: 'Kunci API Ollama tidak ditemukan di server' },
      { status: 401 }
    );
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const ollamaResp = await fetch('https://ollama.com/api/chat', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (ollamaResp.status === 429) {
      return NextResponse.json(
        { success: false, error: 'RATE_LIMITED', message: 'Batas penggunaan terlampaui. Coba lagi nanti.' },
        { status: 429 }
      );
    }

    if (!ollamaResp.ok) {
      const errText = await ollamaResp.text();
      let errMsg = 'Gagal mendapatkan respons dari Ollama';
      try {
        const errJson = JSON.parse(errText);
        errMsg = errJson.error || errMsg;
      } catch {
        // use default error message
      }
      return NextResponse.json(
        { success: false, error: 'OLLAMA_ERROR', message: errMsg },
        { status: ollamaResp.status }
      );
    }

    const data = await ollamaResp.json();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'TIMEOUT', message: 'Permintaan timeout. Coba lagi.' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'NETWORK_ERROR', message: 'Gagal terhubung ke Ollama Cloud' },
      { status: 500 }
    );
  }
}

// =====================
// Gemini Handler
// =====================
async function handleGeminiChat(
  apiKey: string | undefined,
  model: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number
) {
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'API_KEY_MISSING', message: 'Kunci API Gemini diperlukan. Masukkan di Pengaturan.' },
      { status: 401 }
    );
  }

  // Convert messages to Gemini format
  const geminiContents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  const systemMessage = messages.find((m) => m.role === 'system');
  const requestBody: Record<string, unknown> = {
    contents: geminiContents,
    generationConfig: {
      temperature,
      maxOutputTokens: 8192,
    },
  };
  if (systemMessage) {
    requestBody.systemInstruction = {
      parts: [{ text: systemMessage.content }],
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (resp.status === 429) {
      return NextResponse.json(
        { success: false, error: 'RATE_LIMITED', message: 'Batas penggunaan Gemini terlampaui. Coba lagi nanti.' },
        { status: 429 }
      );
    }

    if (!resp.ok) {
      const errData = await resp.json().catch(() => null);
      const errMsg = errData?.error?.message || 'Gagal mendapatkan respons dari Gemini';
      return NextResponse.json(
        { success: false, error: 'GEMINI_ERROR', message: errMsg },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tidak ada respons';

    return NextResponse.json({
      success: true,
      data: {
        message: { role: 'assistant', content: text },
        model,
        finish_reason: 'stop',
      },
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'TIMEOUT', message: 'Permintaan timeout. Coba lagi.' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'NETWORK_ERROR', message: 'Gagal terhubung ke Gemini API' },
      { status: 500 }
    );
  }
}

// =====================
// Claude Handler
// =====================
async function handleClaudeChat(
  apiKey: string | undefined,
  model: string,
  messages: Array<{ role: string; content: string }>,
  temperature: number
) {
  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: 'API_KEY_MISSING', message: 'Kunci API Claude diperlukan. Masukkan di Pengaturan.' },
      { status: 401 }
    );
  }

  // Convert messages to Claude format
  const systemMessage = messages.find((m) => m.role === 'system');
  const claudeMessages = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  const requestBody: Record<string, unknown> = {
    model,
    messages: claudeMessages,
    max_tokens: 8192,
    temperature,
  };
  if (systemMessage) {
    requestBody.system = systemMessage.content;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (resp.status === 429) {
      return NextResponse.json(
        { success: false, error: 'RATE_LIMITED', message: 'Batas penggunaan Claude terlampaui. Coba lagi nanti.' },
        { status: 429 }
      );
    }

    if (!resp.ok) {
      const errData = await resp.json().catch(() => null);
      const errMsg = errData?.error?.message || 'Gagal mendapatkan respons dari Claude';
      return NextResponse.json(
        { success: false, error: 'CLAUDE_ERROR', message: errMsg },
        { status: resp.status }
      );
    }

    const data = await resp.json();
    const text = data.content?.[0]?.text || 'Tidak ada respons';

    return NextResponse.json({
      success: true,
      data: {
        message: { role: 'assistant', content: text },
        model,
        finish_reason: data.stop_reason || 'stop',
      },
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return NextResponse.json(
        { success: false, error: 'TIMEOUT', message: 'Permintaan timeout. Coba lagi.' },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'NETWORK_ERROR', message: 'Gagal terhubung ke Claude API' },
      { status: 500 }
    );
  }
}
