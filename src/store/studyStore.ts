import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StudySet, Flashcard, UsageStats, StudyProgress } from '@/types/studyset';
import { calculateNextReview } from '@/lib/spacedRepetition';
import type { ReviewResult } from '@/lib/spacedRepetition';

interface StudyStore {
  studySets: StudySet[];
  currentSetId: string | null;
  usageStats: UsageStats;
  studyProgress: StudyProgress;

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

  // Spaced Repetition & Progress
  reviewCard: (setId: string, cardId: string, quality: ReviewResult['quality']) => void;
  recordStudySession: (durationMs: number) => void;
  updateStreaks: () => void;
  getProgressStats: () => StudyProgress;

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
      studyProgress: {
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: '',
        studyDates: [],
        totalCardsReviewed: 0,
        totalStudyTimeMs: 0,
        masteredCards: 0,
        learningCards: 0,
        newCards: 0,
        cardsReviewedToday: 0,
        studyTimeToday: 0,
        accuracy: 0,
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

      // Review a card using spaced repetition
      reviewCard: (setId, cardId, quality) =>
        set((state) => {
          const studySet = state.studySets.find((s) => s.id === setId);
          if (!studySet) return state;

          const card = studySet.flashcards.find((c) => c.id === cardId);
          if (!card) return state;

          // Calculate next review using SM-2 algorithm
          const updatedCard = calculateNextReview(card, quality);

          // Update studyProgress
          const today = new Date().toISOString().split('T')[0];
          const newProgress = { ...state.studyProgress };
          newProgress.totalCardsReviewed++;
          newProgress.cardsReviewedToday = newProgress.lastStudyDate === today
            ? newProgress.cardsReviewedToday + 1
            : 1;

          // Update accuracy
          const totalCorrect = quality >= 3 ? 1 : 0;
          newProgress.accuracy = Math.round(
            ((newProgress.accuracy * (newProgress.totalCardsReviewed - 1)) + (totalCorrect * 100)) /
              newProgress.totalCardsReviewed
          );

          return {
            studySets: state.studySets.map((set) =>
              set.id === setId
                ? {
                    ...set,
                    flashcards: set.flashcards.map((c) =>
                      c.id === cardId ? updatedCard : c
                    ),
                    updatedAt: Date.now(),
                  }
                : set
            ),
            studyProgress: newProgress,
          };
        }),

      // Record study session
      recordStudySession: (durationMs) =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const newProgress = { ...state.studyProgress };

          newProgress.totalStudyTimeMs += durationMs;
          newProgress.studyTimeToday = newProgress.lastStudyDate === today
            ? newProgress.studyTimeToday + durationMs
            : durationMs;

          return { studyProgress: newProgress };
        }),

      // Update study streaks
      updateStreaks: () =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const { studyProgress } = state;

          // If already studied today, don't update
          if (studyProgress.lastStudyDate === today) {
            return state;
          }

          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          let newStreak = 1;

          // If studied yesterday, increment streak
          if (studyProgress.lastStudyDate === yesterdayStr) {
            newStreak = studyProgress.currentStreak + 1;
          }

          const newProgress = {
            ...studyProgress,
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, studyProgress.longestStreak),
            lastStudyDate: today,
            studyDates: [...new Set([...studyProgress.studyDates, today])],
            cardsReviewedToday: 0, // Reset daily counter
            studyTimeToday: 0, // Reset daily time
          };

          return { studyProgress: newProgress };
        }),

      // Get current progress stats
      getProgressStats: () => {
        const { studySets, studyProgress } = get();

        // Calculate card categories across all study sets
        const allCards = studySets.flatMap((set) => set.flashcards);
        const newCards = allCards.filter((c) => c.totalReviews === 0).length;
        const learningCards = allCards.filter((c) => c.totalReviews > 0 && c.interval < 7).length;
        const masteredCards = allCards.filter((c) => c.interval >= 21 && c.easeFactor >= 2.5).length;

        return {
          ...studyProgress,
          newCards,
          learningCards,
          masteredCards,
        };
      },

      clearAllData: () =>
        set({
          studySets: [],
          currentSetId: null,
          usageStats: {
            generationsToday: 0,
            lastResetDate: new Date().toISOString().split('T')[0],
            totalGenerations: 0,
          },
          studyProgress: {
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: '',
            studyDates: [],
            totalCardsReviewed: 0,
            totalStudyTimeMs: 0,
            masteredCards: 0,
            learningCards: 0,
            newCards: 0,
            cardsReviewedToday: 0,
            studyTimeToday: 0,
            accuracy: 0,
          },
        }),
    }),
    {
      name: 'study-assistant-storage',
    }
  )
);
