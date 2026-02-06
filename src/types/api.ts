export interface GenerateRequest {
  templateId: string;
  userInput: Record<string, string>;
  previousPrompt?: string;
  refinementFeedback?: string;
  userApiKey?: string;
}

export interface GenerateResponse {
  success: boolean;
  prompt: string;
  error?: string;
  tokensUsed?: number;
}
