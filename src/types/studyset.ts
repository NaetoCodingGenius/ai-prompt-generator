export interface Flashcard {
  id: string;
  front: string; // Question/term
  back: string; // Answer/definition
  confidence?: number; // 0-5 for spaced repetition (future)
  lastReviewed?: number; // Timestamp
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
