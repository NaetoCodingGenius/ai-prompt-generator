import Anthropic from '@anthropic-ai/sdk';
import { Flashcard } from '@/types/studyset';
import { initializeCard } from './spacedRepetition';

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

DETECT THE FORMAT:
- If this is a TEST/QUIZ/WORKSHEET with questions and an answer key, create one flashcard per question-answer pair
- If this is STUDY NOTES/TEXTBOOK, extract key concepts and create Q&A flashcards

For TEST/QUIZ format:
1. Identify each question (numbered 1, 2, 3... with sub-questions a, b, c...)
2. Find the corresponding answers (usually at the bottom or in an "Answers" section)
3. Create ONE flashcard per question with: front = full question text, back = the answer
4. Example: Question "1a) Is y=x² linear or nonlinear?" → Answer "nonlinear" = One flashcard

For STUDY NOTES format:
1. Extract key concepts, definitions, and important facts
2. Create questions that test understanding
3. Make fronts concise questions (10-15 words)
4. Make backs clear, complete answers (20-50 words)

General Rules:
- Avoid yes/no questions
- Each flashcard should test ONE concept
- Return ONLY valid JSON, no markdown or code blocks`;

  // Limit content to ~10k tokens to stay within budget
  const truncatedContent = content.slice(0, 8000);

  const userPrompt = `Create ${count} flashcards from this content:

${truncatedContent}

IMPORTANT:
- If this is a test/quiz with an answer key, create flashcards matching each question to its answer
- Each question (1a, 1b, 2a, etc.) should become ONE flashcard
- Use the full question text as the front, and the specific answer as the back

Return JSON array:
[
  { "front": "Full question text", "back": "Answer" },
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

  // Add IDs and initialize SRS values for flashcards
  const flashcards: Flashcard[] = flashcardsRaw.map((card: any) =>
    initializeCard({
      id: crypto.randomUUID(),
      front: card.front || '',
      back: card.back || '',
    })
  );

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
