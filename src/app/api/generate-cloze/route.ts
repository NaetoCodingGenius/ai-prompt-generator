import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-3-haiku-20240307';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, count = 15 } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'No text content provided' },
        { status: 400 }
      );
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = `You are an expert at creating cloze deletion flashcards for studying.

UNDERSTAND THE FORMAT:
- If this is a TEST/WORKSHEET with numbered questions (1, 2, 3...) and lettered sub-questions (a, b, c...), those are PRACTICE PROBLEMS
- Practice problems are for testing knowledge the student already has
- DO NOT wrap answers to practice problems
- ONLY wrap the KEY CONCEPTS/TOPICS mentioned in the question prompts

CRITICAL RULES:
1. Wrap ONLY ${count} KEY CONCEPTS total across the ENTIRE text
2. Wrap a term ONLY THE FIRST TIME it appears or when it's being DEFINED
3. DO NOT wrap the same word multiple times (e.g., if "slope" appears 10 times, wrap it ONCE when first introduced)
4. DO NOT wrap: practice problem answers, option letters (a, b, c), question numbers (1, 2, 3), common words
5. Focus on: main topics, key vocabulary when first introduced, important formulas, definitions
6. If text has numbered questions (1, 2, 3...), wrap only the TOPIC/CONCEPT being tested in that question
7. Be EXTREMELY SELECTIVE - wrap only the most important ${count} terms in the WHOLE document

EXAMPLES:

Input: "MTH1W2 Linear Relations Test. 1. Determine if each relationship is linear or nonlinear: a) y=2x b) y=x²"
GOOD: "MTH1W2 {{Linear Relations}} Test. 1. Determine if each relationship is {{linear}} or {{nonlinear}}: a) y=2x b) y=x²"
BAD: "MTH1W2 {{Linear}} {{Relations}} {{Test}}. 1. Determine if each {{relationship}} is {{linear}} or {{nonlinear}}: a) {{y=2x}} b) {{y=x²}}"

Input: "1. Find the slope. 2. Find the slope. 3. Find the slope."
GOOD: "1. Find the {{slope}}. 2. Find the slope. 3. Find the slope."
BAD: "1. Find the {{slope}}. 2. Find the {{slope}}. 3. Find the {{slope}}."

Remember:
- Wrap each important term ONLY ONCE (first occurrence)
- Practice problem answers = NO wrapping
- Main concepts/topics = YES wrapping
- Total ${count} clozes across ENTIRE text`;

    const userPrompt = `Add approximately ${count} cloze deletions to this text by wrapping important terms in {{double braces}}:

${text.slice(0, 8000)}

Return the text with cloze markers inserted. NO explanations, JUST the marked-up text.`;

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

    const clozeText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Validate that cloze markers were added
    const clozeCount = (clozeText.match(/\{\{[^}]+\}\}/g) || []).length;

    if (clozeCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate cloze deletions' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      clozeText,
      clozeCount,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    });
  } catch (error) {
    console.error('Cloze generation error:', error);

    let errorMessage = 'Failed to generate cloze deletions';
    if (error instanceof Error) {
      errorMessage = error.message;

      if (errorMessage.includes('authentication') || errorMessage.includes('api_key')) {
        errorMessage = 'Server configuration error. Please contact support.';
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
