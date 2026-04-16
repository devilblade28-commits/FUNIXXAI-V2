'use client';

import { useChatStore, type Provider } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Settings, Trash2, Hexagon } from 'lucide-react';
import { SettingsDrawer } from '@/components/settings/SettingsDrawer';
import { ModelSelector } from '@/components/provider/ModelSelector';

const PROVIDER_CONFIG: Record<Provider, { label: string; activeClass: string }> = {
  ollama: {
    label: 'Ollama',
    activeClass: 'bg-blue-500/20 text-blue-300 border border-blue-400/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]',
  },
  gemini: {
    label: 'Gemini',
    activeClass: 'bg-purple-500/20 text-purple-300 border border-purple-400/30 shadow-[0_0_12px_rgba(139,92,246,0.15)]',
  },
  claude: {
    label: 'Claude',
    activeClass: 'bg-violet-500/20 text-violet-300 border border-violet-400/30 shadow-[0_0_12px_rgba(167,139,250,0.15)]',
  },
};

export function ChatHeader() {
  const { activeProvider, setActiveProvider, setSettingsOpen, clearMessages } =
    useChatStore();

  return (
    <>
      <header className="relative z-10 flex flex-col gap-3 glass-strong px-4 py-3 sm:px-6">
        {/* Gradient divider at bottom */}
        <div className="absolute bottom-0 left-0 right-0 gradient-divider" />

        {/* Top row: App name + Settings */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/25 to-purple-500/25 border border-blue-400/20 glow-gradient">
              <Hexagon className="h-4.5 w-4.5 text-white" strokeWidth={1.8} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">
                Funixx<span className="gradient-text">AI</span>
              </h1>
              <p className="text-[10px] text-blue-300/60 leading-none font-medium tracking-wide uppercase">
                Multi-Provider Chat
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-400/10"
              onClick={() => clearMessages(activeProvider)}
              title="Hapus percakapan"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.8} />
            </Button>
            <div className="gradient-divider-v h-5 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5"
              onClick={() => setSettingsOpen(true)}
              title="Pengaturan"
            >
              <Settings className="h-4 w-4" strokeWidth={1.8} />
            </Button>
          </div>
        </div>

        {/* Provider Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl glass-subtle p-1 flex-1">
            {(Object.keys(PROVIDER_CONFIG) as Provider[]).map((p) => (
              <Button
                key={p}
                variant="ghost"
                size="sm"
                className={`flex-1 rounded-lg text-xs font-medium transition-all ${
                  activeProvider === p
                    ? PROVIDER_CONFIG[p].activeClass
                    : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                }`}
                onClick={() => setActiveProvider(p)}
              >
                {PROVIDER_CONFIG[p].label}
              </Button>
            ))}
          </div>
        </div>

        {/* Model Selector - only visible when Ollama is active */}
        {activeProvider === 'ollama' && <ModelSelector />}
      </header>
      <SettingsDrawer />
    </>
  );
}
