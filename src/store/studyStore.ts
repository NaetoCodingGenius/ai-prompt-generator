import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StudySet, Flashcard, UsageStats } from '@/types/studyset';

interface StudyStore {
  studySets: StudySet[];
  currentSetId: string | null;
  usageStats: UsageStats;

  // CRUD operations
  addStudySet: (set: StudySet) => void;
  updateStudySet: (id: string, updates: Partial<StudySet>) => void;
  deleteStudySet: (id: string) => void;
  getStudySetById: (id: string) => StudySet | undefined;

  // Usage tracking
  incrementUsage: () => void;
  canGenerateToday: () => boolean;
  getRemainingGenerations: () => number;
  resetDailyUsageIfNeeded: () => void;

  // Study mode
  setCurrentSet: (id: string | null) => void;
  updateFlashcard: (setId: string, cardId: string, updates: Partial<Flashcard>) => void;

  // Clear all data
  clearAllData: () => void;
}

const FREE_TIER_DAILY_LIMIT = 3;

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
      studySets: [],
      currentSetId: null,
      usageStats: {
        generationsToday: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        totalGenerations: 0,
      },

      addStudySet: (studySet) =>
        set((state) => ({
          studySets: [studySet, ...state.studySets],
        })),

      updateStudySet: (id, updates) =>
        set((state) => ({
          studySets: state.studySets.map((set) =>
            set.id === id ? { ...set, ...updates, updatedAt: Date.now() } : set
          ),
        })),

      deleteStudySet: (id) =>
        set((state) => ({
          studySets: state.studySets.filter((set) => set.id !== id),
          currentSetId: state.currentSetId === id ? null : state.currentSetId,
        })),

      getStudySetById: (id) => {
        return get().studySets.find((set) => set.id === id);
      },

      incrementUsage: () =>
        set((state) => {
          get().resetDailyUsageIfNeeded();
          return {
            usageStats: {
              ...state.usageStats,
              generationsToday: state.usageStats.generationsToday + 1,
              totalGenerations: state.usageStats.totalGenerations + 1,
            },
          };
        }),

      canGenerateToday: () => {
        get().resetDailyUsageIfNeeded();
        const { usageStats } = get();
        return usageStats.generationsToday < FREE_TIER_DAILY_LIMIT;
      },

      getRemainingGenerations: () => {
        get().resetDailyUsageIfNeeded();
        const { usageStats } = get();
        return Math.max(0, FREE_TIER_DAILY_LIMIT - usageStats.generationsToday);
      },

      resetDailyUsageIfNeeded: () => {
        const today = new Date().toISOString().split('T')[0];
        const { usageStats } = get();

        if (usageStats.lastResetDate !== today) {
          set({
            usageStats: {
              ...usageStats,
              generationsToday: 0,
              lastResetDate: today,
            },
          });
        }
      },

      setCurrentSet: (id) =>
        set({
          currentSetId: id,
        }),

      updateFlashcard: (setId, cardId, updates) =>
        set((state) => ({
          studySets: state.studySets.map((set) =>
            set.id === setId
              ? {
                  ...set,
                  flashcards: set.flashcards.map((card) =>
                    card.id === cardId ? { ...card, ...updates } : card
                  ),
                  updatedAt: Date.now(),
                }
              : set
          ),
        })),

      clearAllData: () =>
        set({
          studySets: [],
          currentSetId: null,
          usageStats: {
            generationsToday: 0,
            lastResetDate: new Date().toISOString().split('T')[0],
            totalGenerations: 0,
          },
        }),
    }),
    {
      name: 'study-assistant-storage',
    }
  )
);
