import { Flashcard } from './studyset';

// PDF Upload endpoint
export interface UploadResponse {
  success: boolean;
  text?: string;
  pageCount?: number;
  fileName?: string;
  error?: string;
}

// Flashcard generation endpoint
export interface GenerateRequest {
  text: string;
  count?: number;
  includeSummary?: boolean; // Whether to also generate a summary
}

export interface GenerateResponse {
  success: boolean;
  flashcards?: Flashcard[];
  summary?: string; // AI-generated summary of the content
  metadata?: {
    model: string;
    tokensUsed: number;
    processingTime: number;
    remaining: number; // Remaining generations today
  };
  error?: string;
  limitReached?: boolean;
}
