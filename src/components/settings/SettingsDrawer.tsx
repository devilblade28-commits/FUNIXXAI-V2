'use client';

import { useChatStore } from '@/lib/store';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Key, ShieldCheck, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function SettingsDrawer() {
  const {
    settingsOpen,
    setSettingsOpen,
    geminiApiKey,
    setGeminiApiKey,
    claudeApiKey,
    setClaudeApiKey,
    clearAllMessages,
  } = useChatStore();

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showClaudeKey, setShowClaudeKey] = useState(false);

  return (
    <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto border-l border-white/[0.06] bg-[rgba(8,8,20,0.92)] backdrop-blur-2xl"
      >
        <SheetHeader className="space-y-1 mb-6">
          <SheetTitle className="flex items-center gap-2.5 text-lg text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/15">
              <Key className="h-4 w-4 text-blue-400" strokeWidth={1.5} />
            </div>
            Pengaturan
          </SheetTitle>
          <SheetDescription className="text-white/40">
            Kelola kunci API dan preferensi aplikasi
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Ollama Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-blue-400" strokeWidth={1.5} />
              <h3 className="text-sm font-bold text-white">Ollama Cloud</h3>
            </div>
            <div className="rounded-xl glass border border-blue-400/10 p-4">
              <p className="text-xs text-white/40 leading-relaxed">
                Kunci API Ollama disimpan aman di server. Anda tidak perlu memasukkan kunci API secara manual.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
                <span className="text-[10px] text-blue-400 font-bold tracking-wide uppercase">
                  Terkelola Server-Side
                </span>
              </div>
            </div>
          </div>

          {/* Gradient divider */}
          <div className="gradient-divider" />

          {/* Gemini Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(139,92,246,0.5)]" />
              Gemini (Google)
            </h3>
            <div className="space-y-2">
              <Label htmlFor="gemini-key" className="text-xs text-white/40">
                Kunci API Gemini
              </Label>
              <div className="flex gap-2">
                <Input
                  id="gemini-key"
                  type={showGeminiKey ? 'text' : 'password'}
                  placeholder="AIza..."
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="h-9 text-xs glass-subtle border-white/[0.06] text-white/80 placeholder:text-white/20 focus:border-purple-400/30 focus:ring-purple-400/20"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-xs glass-subtle border-white/[0.08] text-white/50 hover:text-white hover:bg-white/5"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                >
                  {showGeminiKey ? 'Sembunyikan' : 'Tampilkan'}
                </Button>
              </div>
              <p className="text-[10px] text-white/25">
                Dapatkan dari Google AI Studio (aistudio.google.com)
              </p>
            </div>
          </div>

          {/* Gradient divider */}
          <div className="gradient-divider" />

          {/* Claude Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2.5">
              <div className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.5)]" />
              Claude (Anthropic)
            </h3>
            <div className="space-y-2">
              <Label htmlFor="claude-key" className="text-xs text-white/40">
                Kunci API Claude
              </Label>
              <div className="flex gap-2">
                <Input
                  id="claude-key"
                  type={showClaudeKey ? 'text' : 'password'}
                  placeholder="sk-ant-..."
                  value={claudeApiKey}
                  onChange={(e) => setClaudeApiKey(e.target.value)}
                  className="h-9 text-xs glass-subtle border-white/[0.06] text-white/80 placeholder:text-white/20 focus:border-violet-400/30 focus:ring-violet-400/20"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 text-xs glass-subtle border-white/[0.08] text-white/50 hover:text-white hover:bg-white/5"
                  onClick={() => setShowClaudeKey(!showClaudeKey)}
                >
                  {showClaudeKey ? 'Sembunyikan' : 'Tampilkan'}
                </Button>
              </div>
              <p className="text-[10px] text-white/25">
                Dapatkan dari Anthropic Console (console.anthropic.com)
              </p>
            </div>
          </div>

          {/* Gradient divider */}
          <div className="gradient-divider" />

          {/* Danger Zone */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-red-400 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.5)]" />
              Zona Bahaya
            </h3>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs text-red-400 glass-subtle border-red-400/15 hover:bg-red-500/10 hover:text-red-300 hover:border-red-400/25 w-full justify-start"
              onClick={() => {
                clearAllMessages();
                setSettingsOpen(false);
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" strokeWidth={1.5} />
              Hapus Semua Percakapan
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-white/15 font-medium tracking-wide">
            Funixx AI v1.0 &middot; Dibuat di Indonesia
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
