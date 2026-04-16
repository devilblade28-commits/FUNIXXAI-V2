'use client';

import { useRef, useEffect } from 'react';
import { useChatStore } from '@/lib/store';
import { ChatMessage } from './ChatMessage';
import { Bot } from 'lucide-react';

export function ChatArea() {
  const { activeProvider, messages, isLoading, error } = useChatStore();
  const currentMessages = messages[activeProvider];
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive or loading state changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentMessages, isLoading]);

  return (
    <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto px-4 py-4 sm:px-6 scroll-smooth">
      {currentMessages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mx-auto max-w-3xl space-y-4 pb-4">
          {currentMessages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && <TypingIndicator />}
          {error && <ErrorMessage error={error} />}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  const { activeProvider } = useChatStore();
  const providerLabel =
    activeProvider === 'ollama'
      ? 'Ollama Cloud'
      : activeProvider.charAt(0).toUpperCase() + activeProvider.slice(1);

  const suggestions = [
    'Jelaskan React Server Components',
    'Buat kode Python sorting',
    'Tips belajar programming',
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 px-4 text-center">
      {/* Floating icon */}
      <div className="animate-float">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/15 via-purple-500/10 to-blue-600/15 border border-blue-400/20 glow-gradient">
          <Bot className="h-9 w-9 text-white" strokeWidth={1.5} />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white">
          Selamat Datang di Funixx<span className="gradient-text">AI</span>
        </h2>
        <p className="text-sm text-white/40 max-w-xs leading-relaxed">
          Mulai percakapan dengan{' '}
          <span className="text-blue-300 font-medium">{providerLabel}</span>.
          Ketik pesan di bawah untuk memulai.
        </p>
      </div>
      {/* Suggestion chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion}
            className="rounded-xl glass-subtle px-4 py-2 text-xs text-white/50 hover:text-white/70 transition-colors cursor-default"
          >
            {suggestion}
          </div>
        ))}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl glass-subtle">
        <Bot className="h-4 w-4 text-blue-400" strokeWidth={1.5} />
      </div>
      <div className="rounded-2xl rounded-tl-md glass px-5 py-3.5">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:0ms] shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
          <div className="h-2 w-2 rounded-full bg-purple-400 animate-bounce [animation-delay:150ms] shadow-[0_0_6px_rgba(139,92,246,0.5)]" />
          <div className="h-2 w-2 rounded-full bg-blue-400 animate-bounce [animation-delay:300ms] shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
        </div>
      </div>
    </div>
  );
}

function ErrorMessage({ error }: { error: string }) {
  return (
    <div className="rounded-xl glass border border-red-400/20 bg-red-500/5 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
      <div className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0 shadow-[0_0_6px_rgba(248,113,113,0.5)]" />
      {error}
    </div>
  );
}
