'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Provider = 'gemini' | 'claude' | 'ollama';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface ChatState {
  // Provider
  activeProvider: Provider;
  setActiveProvider: (provider: Provider) => void;

  // Ollama model
  selectedModel: string;
  setSelectedModel: (model: string) => void;

  // API Keys (Gemini & Claude only - Ollama is server-side)
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  claudeApiKey: string;
  setClaudeApiKey: (key: string) => void;

  // Chat messages per provider
  messages: Record<Provider, ChatMessage[]>;
  addMessage: (provider: Provider, message: ChatMessage) => void;
  clearMessages: (provider: Provider) => void;
  clearAllMessages: () => void;

  // Loading & Error states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;

  // Settings drawer
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}

// FIX: Sanitize API key input — strip whitespace
function sanitizeKey(key: string): string {
  return key.trim();
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      // Provider
      activeProvider: 'ollama',
      setActiveProvider: (provider) => set({ activeProvider: provider }),

      // Ollama model
      selectedModel: 'qwen3.5',
      setSelectedModel: (model) => set({ selectedModel: model }),

      // API Keys — FIX: sanitized on input
      geminiApiKey: '',
      setGeminiApiKey: (key) => set({ geminiApiKey: sanitizeKey(key) }),
      claudeApiKey: '',
      setClaudeApiKey: (key) => set({ claudeApiKey: sanitizeKey(key) }),

      // Chat messages
      messages: {
        gemini: [],
        claude: [],
        ollama: [],
      },
      addMessage: (provider, message) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [provider]: [...state.messages[provider], message],
          },
        })),
      clearMessages: (provider) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [provider]: [],
          },
        })),
      clearAllMessages: () =>
        set({
          messages: {
            gemini: [],
            claude: [],
            ollama: [],
          },
        }),

      // Loading & Error
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      error: null,
      setError: (error) => set({ error }),

      // Settings
      settingsOpen: false,
      setSettingsOpen: (open) => set({ settingsOpen: open }),
    }),
    {
      name: 'funixx-ai-storage',
      partialize: (state) => ({
        activeProvider: state.activeProvider,
        selectedModel: state.selectedModel,
        geminiApiKey: state.geminiApiKey,
        claudeApiKey: state.claudeApiKey,
        messages: state.messages,
      }),
    }
  )
);
