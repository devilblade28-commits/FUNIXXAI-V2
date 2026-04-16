'use client';

import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ChatMessage as ChatMessageType } from '@/lib/store';
import { User, Bot, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Props {
  message: ChatMessageType;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
          isUser
            ? 'glass border border-white/10'
            : 'glass-subtle border border-blue-400/20'
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white/80" strokeWidth={1.5} />
        ) : (
          <Bot className="h-4 w-4 text-blue-400" strokeWidth={1.5} />
        )}
      </div>

      {/* Message Bubble */}
      <div
        className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'rounded-tr-md bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-[0_4px_20px_rgba(59,130,246,0.2)]'
            : 'rounded-tl-md glass border border-white/[0.06] text-white/90'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words text-white/95">{message.content}</p>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none break-words">
            <ReactMarkdown
              components={{
                code({ className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !match;

                  if (isInline) {
                    return (
                      <code
                        className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-xs font-mono text-blue-300 border border-blue-400/10"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  }

                  return (
                    <div className="relative my-3 overflow-hidden rounded-xl glass border border-white/[0.06]">
                      {/* Code header with gradient */}
                      <div className="flex items-center justify-between rounded-t-xl bg-gradient-to-r from-blue-500/10 via-purple-500/5 to-blue-600/10 px-4 py-2 border-b border-white/[0.04]">
                        <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                          {match[1]}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 text-white/30 hover:text-blue-400"
                          onClick={() => copyToClipboard(String(children))}
                        >
                          {copied ? (
                            <Check className="h-3 w-3 text-blue-400" strokeWidth={2} />
                          ) : (
                            <Copy className="h-3 w-3" strokeWidth={1.5} />
                          )}
                        </Button>
                      </div>
                      <SyntaxHighlighter
                        style={oneDark}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          padding: '1rem',
                          background: 'rgba(5, 5, 20, 0.6)',
                          fontSize: '0.8rem',
                          border: 'none',
                        }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </div>
                  );
                },
                p({ children }) {
                  return <p className="mb-2 last:mb-0 text-white/85">{children}</p>;
                },
                ul({ children }) {
                  return <ul className="mb-2 ml-4 list-disc space-y-1 text-white/80">{children}</ul>;
                },
                ol({ children }) {
                  return <ol className="mb-2 ml-4 list-decimal space-y-1 text-white/80">{children}</ol>;
                },
                li({ children }) {
                  return <li className="marker:text-blue-400/60">{children}</li>;
                },
                h1({ children }) {
                  return <h1 className="mb-2 mt-4 text-lg font-bold text-white">{children}</h1>;
                },
                h2({ children }) {
                  return <h2 className="mb-2 mt-3 text-base font-bold text-white">{children}</h2>;
                },
                h3({ children }) {
                  return <h3 className="mb-1 mt-2 text-sm font-bold text-white">{children}</h3>;
                },
                blockquote({ children }) {
                  return (
                    <blockquote className="mb-2 border-l-2 border-purple-400/40 pl-3 italic text-white/50">
                      {children}
                    </blockquote>
                  );
                },
                a({ href, children }) {
                  return (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline decoration-blue-400/30 underline-offset-2 hover:text-blue-300 hover:decoration-blue-300/50 transition-colors"
                    >
                      {children}
                    </a>
                  );
                },
                table({ children }) {
                  return (
                    <div className="my-2 overflow-x-auto rounded-xl glass border border-white/[0.06]">
                      <table className="w-full text-xs">{children}</table>
                    </div>
                  );
                },
                th({ children }) {
                  return (
                    <th className="border-b border-white/[0.06] px-3 py-2 text-left font-semibold text-white/80 bg-gradient-to-r from-blue-500/5 to-purple-500/5">
                      {children}
                    </th>
                  );
                },
                td({ children }) {
                  return <td className="border-b border-white/[0.04] px-3 py-2 text-white/70">{children}</td>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        {/* Copy button for assistant messages */}
        {!isUser && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute -right-2 -bottom-2 h-6 w-6 rounded-full glass opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/10 text-white/40 hover:text-blue-400"
            onClick={() => copyToClipboard(message.content)}
          >
            {copied ? (
              <Check className="h-3 w-3 text-blue-400" strokeWidth={2} />
            ) : (
              <Copy className="h-3 w-3" strokeWidth={1.5} />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
