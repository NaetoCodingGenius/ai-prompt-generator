import { create } from 'zustand';

interface AppStore {
  selectedTemplateId: string | null;
  currentPromptId: string | null;
  isGenerating: boolean;
  setSelectedTemplate: (id: string | null) => void;
  setCurrentPrompt: (id: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  selectedTemplateId: null,
  currentPromptId: null,
  isGenerating: false,
  setSelectedTemplate: (id) => set({ selectedTemplateId: id }),
  setCurrentPrompt: (id) => set({ currentPromptId: id }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
}));
