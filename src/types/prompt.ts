export interface GeneratedPrompt {
  id: string;
  timestamp: number;
  templateId: string;
  templateName: string;
  userInput: Record<string, string>;
  generatedPrompt: string;
  refinements: Refinement[];
  metadata: {
    model: string;
    tokensUsed?: number;
  };
}

export interface Refinement {
  id: string;
  timestamp: number;
  feedback: string;
  refinedPrompt: string;
}
