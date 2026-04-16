import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.OLLAMA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { valid: false, error: 'Kunci API tidak ditemukan di server' },
      { status: 401 }
    );
  }

  try {
    const testResp = await fetch('https://ollama.com/api/chat', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen3.5',
        messages: [{ role: 'user', content: 'test' }],
        stream: false,
      }),
    });

    if (testResp.ok) {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json(
        { valid: false, error: 'Kunci API tidak valid' },
        { status: 401 }
      );
    }
  } catch (err) {
    return NextResponse.json(
      { valid: false, error: 'Gagal terhubung ke Ollama Cloud' },
      { status: 500 }
    );
  }
}
