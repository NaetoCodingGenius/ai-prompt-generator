import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export interface TutorRequest {
  question: string;
  context: string; // The study material (PDF text or flashcard content)
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface TutorResponse {
  success: boolean;
  answer?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TutorRequest = await request.json();
    const { question, context, conversationHistory = [] } = body;

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'No question provided' } as TutorResponse,
        { status: 400 }
      );
    }

    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const systemPrompt = `You are an expert AI tutor helping a student understand their study material. You have access to the student's study material and should answer questions based on that context.

Guidelines:
1. Answer clearly and concisely
2. Use examples from the study material when possible
3. Break down complex concepts into simpler parts
4. If asked to explain differently, try analogies or real-world examples
5. Encourage understanding, not just memorization
6. If the question is outside the study material, politely redirect to the material

Study Material Context:
${context.slice(0, 3000)}`;

    // Build conversation messages
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: question },
    ];

    const message = await client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const answer = message.content[0].type === 'text' ? message.content[0].text : '';

    return NextResponse.json({
      success: true,
      answer,
    } as TutorResponse);
  } catch (error) {
    console.error('AI Tutor error:', error);

    let errorMessage = 'Failed to get tutor response';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      } as TutorResponse,
      { status: 500 }
    );
  }
}
