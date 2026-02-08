export interface Flashcard {
  id: string;
  front: string; // Question/term
  back: string; // Answer/definition

  // Spaced Repetition System (SM-2 Algorithm)
  easeFactor: number; // 1.3-2.5, default 2.5 (difficulty multiplier)
  interval: number; // Days until next review (0 = new, 1 = learning, 2+ = review)
  repetitions: number; // Number of consecutive correct reviews
  nextReviewDate: number; // Timestamp when card should be reviewed next
  lastReviewed: number | null; // Timestamp of last review

  // Study stats
  totalReviews: number; // Total times reviewed
  correctCount: number; // Times answered correctly
  incorrectCount: number; // Times answered incorrectly
}

export interface StudySet {
  id: string;
  title: string;
  description?: string;
  summary?: string; // AI-generated summary of the material
  sourceType: 'pdf' | 'screenshot' | 'youtube' | 'voice' | 'manual';
  sourceName: string; // Original file name or URL
  flashcards: Flashcard[];
  createdAt: number;
  updatedAt: number;
  metadata: {
    model: string;
    tokensUsed: number;
    processingTime: number;
  };
}

export interface QuizResult {
  correct: number;
  total: number;
  percentage: number;
  answers: {
    cardId: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
}

export interface UsageStats {
  generationsToday: number;
  lastResetDate: string; // YYYY-MM-DD format
  totalGenerations: number;
}

export interface StudyProgress {
  // Study streaks
  currentStreak: number; // Days studied in a row
  longestStreak: number; // Best streak ever
  lastStudyDate: string; // YYYY-MM-DD format
  studyDates: string[]; // All dates user studied (for calendar heatmap)

  // Overall stats
  totalCardsReviewed: number;
  totalStudyTimeMs: number; // Total time spent studying (milliseconds)
  masteredCards: number; // Cards with easeFactor >= 2.5 and interval >= 21
  learningCards: number; // Cards in learning phase (interval < 7)
  newCards: number; // Cards never reviewed

  // Daily stats
  cardsReviewedToday: number;
  studyTimeToday: number;
  accuracy: number; // Percentage correct (0-100)
}
