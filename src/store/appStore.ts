import { create } from 'zustand';

interface AppStore {
  isGenerating: boolean;
  isStudying: boolean;
  currentCardIndex: number;
  showAnswer: boolean;

  setIsGenerating: (loading: boolean) => void;
  setIsStudying: (studying: boolean) => void;
  setCurrentCardIndex: (index: number) => void;
  setShowAnswer: (show: boolean) => void;
  toggleAnswer: () => void;
  nextCard: (maxIndex: number) => void;
  previousCard: () => void;
  resetStudyMode: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  isGenerating: false,
  isStudying: false,
  currentCardIndex: 0,
  showAnswer: false,

  setIsGenerating: (loading) => set({ isGenerating: loading }),
  setIsStudying: (studying) =>
    set({
      isStudying: studying,
      currentCardIndex: studying ? 0 : 0,
      showAnswer: false,
    }),
  setCurrentCardIndex: (index) => set({ currentCardIndex: index, showAnswer: false }),
  setShowAnswer: (show) => set({ showAnswer: show }),
  toggleAnswer: () => set((state) => ({ showAnswer: !state.showAnswer })),
  nextCard: (maxIndex) =>
    set((state) => ({
      currentCardIndex: Math.min(state.currentCardIndex + 1, maxIndex),
      showAnswer: false,
    })),
  previousCard: () =>
    set((state) => ({
      currentCardIndex: Math.max(state.currentCardIndex - 1, 0),
      showAnswer: false,
    })),
  resetStudyMode: () =>
    set({
      currentCardIndex: 0,
      showAnswer: false,
      isStudying: false,
    }),
}));
