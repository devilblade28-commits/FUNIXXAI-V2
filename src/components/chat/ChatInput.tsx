'use client';

import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { useChatStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Square } from 'lucide-react';

export function ChatInput() {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // FIX: Track the AbortController so we can cancel in-flight requests
  const abortRef = useRef<AbortController | null>(null);

  const {
    activeProvider,
    selectedModel,
    geminiApiKey,
    claudeApiKey,
    addMessage,
    isLoading,
    setIsLoading,
    setError,
  } = useChatStore();

  const handleSubmit = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    setError(null);
    setIsLoading(true);

    // Add user message
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content: trimmed,
      timestamp: Date.now(),
    };
    addMessage(activeProvider, userMessage);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // FIX: Create AbortController for this request
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Get existing messages for context (read latest from store)
      const { messages } = useChatStore.getState();
      const chatMessages = messages[activeProvider].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: activeProvider,
          model: activeProvider === 'ollama' ? selectedModel : undefined,
          messages: chatMessages,
          temperature: 0.7,
          apiKey:
            activeProvider === 'gemini'
              ? geminiApiKey
              : activeProvider === 'claude'
                ? claudeApiKey
                : undefined,
        }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message || 'Terjadi kesalahan yang tidak diketahui');
        return;
      }

      // Add assistant message
      const assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: data.data?.message?.content || 'Tidak ada respons',
        timestamp: Date.now(),
      };
      addMessage(activeProvider, assistantMessage);
    } catch (err: unknown) {
      // FIX: Don't show error if user intentionally aborted
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      setError('Gagal mengirim pesan. Periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [
    input,
    isLoading,
    activeProvider,
    selectedModel,
    geminiApiKey,
    claudeApiKey,
    addMessage,
    setError,
    setIsLoading,
  ]);

  // FIX: Handle stop button click — actually abort the request
  const handleStop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsLoading(false);
  }, [setIsLoading]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
    }
  };

  return (
    <div className="relative z-10 glass-strong px-4 py-3 sm:px-6">
      {/* Gradient divider at top */}
      <div className="absolute top-0 left-0 right-0 gradient-divider" />
      <div className="mx-auto max-w-3xl pt-1">
        <div
          className={`flex items-end gap-2 rounded-xl p-2 transition-all duration-200 ${
            isLoading
              ? 'glass border border-red-400/20'
              : 'glass-subtle border border-transparent focus-within:border-blue-400/25 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.08)]'
          }`}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ketik pesan..."
            rows={1}
            className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-white/90 placeholder:text-white/25 focus:outline-none min-h-[36px] max-h-[160px]"
            disabled={isLoading}
          />
          <Button
            size="icon"
            className={`h-8 w-8 shrink-0 rounded-lg transition-all duration-200 ${
              isLoading
                ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-400/20'
                : input.trim()
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-[0_2px_12px_rgba(59,130,246,0.25)]'
                  : 'glass text-white/20'
            }`}
            onClick={isLoading ? handleStop : handleSubmit}
            disabled={!isLoading && !input.trim()}
          >
            {isLoading ? (
              <Square className="h-3.5 w-3.5" strokeWidth={2} />
            ) : (
              <SendHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
            )}
          </Button>
        </div>
        <p className="mt-1.5 text-center text-[10px] text-white/20 font-medium tracking-wide">
          Funixx AI dapat membuat kesalahan. Periksa informasi penting.
        </p>
      </div>
    </div>
  );
}
