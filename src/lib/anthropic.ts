import Anthropic from '@anthropic-ai/sdk';
import { Flashcard } from '@/types/studyset';

// Use Claude 3 Haiku for cost-effective flashcard generation (90% cheaper than Opus)
const MODEL = 'claude-3-haiku-20240307';

export interface GenerateFlashcardsOptions {
  content: string;
  count?: number;
}

/**
 * Generate flashcards from text content using Claude Haiku
 */
export async function generateFlashcards(
  options: GenerateFlashcardsOptions
): Promise<{ flashcards: Flashcard[]; tokensUsed: number }> {
  const { content, count = 20 } = options;

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const systemPrompt = `You are an expert study assistant. Create high-quality flashcards from the provided content.

Rules:
1. Extract key concepts, definitions, and important facts
2. Make fronts concise questions (10-15 words)
3. Make backs clear, complete answers (20-50 words)
4. Avoid yes/no questions
5. Cover different topics evenly
6. Return ONLY valid JSON, no markdown or code blocks`;

  // Limit content to ~10k tokens to stay within budget
  const truncatedContent = content.slice(0, 8000);

  const userPrompt = `Create ${count} flashcards from this content:

${truncatedContent}

Return JSON array:
[
  { "front": "Question or term", "back": "Answer or definition" },
  ...
]`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

  // Parse JSON response (extract JSON array from response)
  const jsonMatch = responseText.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Failed to parse flashcards from AI response');
  }

  const flashcardsRaw = JSON.parse(jsonMatch[0]);

  // Add IDs and metadata to flashcards
  const flashcards: Flashcard[] = flashcardsRaw.map((card: any) => ({
    id: crypto.randomUUID(),
    front: card.front || '',
    back: card.back || '',
    confidence: 0,
    lastReviewed: null,
  }));

  return {
    flashcards,
    tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
  };
}

/**
 * Generate a summary of the study material
 */
export async function generateSummary(
  content: string
): Promise<{ summary: string; tokensUsed: number }> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const systemPrompt = `You are an expert at summarizing study material. Create a clear, concise summary that:
1. Highlights the main topics and key concepts
2. Organizes information logically
3. Uses bullet points for clarity
4. Keeps it brief but comprehensive (200-400 words)`;

  const truncatedContent = content.slice(0, 8000);

  const userPrompt = `Summarize this study material:

${truncatedContent}

Provide a well-structured summary with:
- Main topics covered
- Key concepts and definitions
- Important facts to remember`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  });

  const summary = message.content[0].type === 'text' ? message.content[0].text : '';

  return {
    summary,
    tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
  };
}
