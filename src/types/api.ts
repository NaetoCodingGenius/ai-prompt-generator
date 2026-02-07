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
}

export interface GenerateResponse {
  success: boolean;
  flashcards?: Flashcard[];
  metadata?: {
    model: string;
    tokensUsed: number;
    processingTime: number;
    remaining: number; // Remaining generations today
  };
  error?: string;
  limitReached?: boolean;
}
