import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GeneratedPrompt } from '@/types/prompt';

interface PromptStore {
  prompts: GeneratedPrompt[];
  addPrompt: (prompt: GeneratedPrompt) => void;
  updatePrompt: (id: string, updates: Partial<GeneratedPrompt>) => void;
  deletePrompt: (id: string) => void;
  clearHistory: () => void;
  getPromptById: (id: string) => GeneratedPrompt | undefined;
}

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      prompts: [],

      addPrompt: (prompt) =>
        set((state) => ({
          prompts: [prompt, ...state.prompts],
        })),

      updatePrompt: (id, updates) =>
        set((state) => ({
          prompts: state.prompts.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      deletePrompt: (id) =>
        set((state) => ({
          prompts: state.prompts.filter((p) => p.id !== id),
        })),

      clearHistory: () => set({ prompts: [] }),

      getPromptById: (id) => get().prompts.find((p) => p.id === id),
    }),
    {
      name: 'prompt-history-storage',
    }
  )
);
