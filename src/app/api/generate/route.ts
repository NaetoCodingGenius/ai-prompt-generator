import { NextRequest, NextResponse } from 'next/server';
import { generateFlashcards } from '@/lib/anthropic';
import { GenerateRequest, GenerateResponse } from '@/types/api';

// Simple IP-based daily rate limiting (in-memory)
// Maps IP address to usage count and date
const usageTracker = new Map<string, { count: number; date: string }>();

const DAILY_LIMIT = 3;

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Check/update daily limit
    const usage = usageTracker.get(ip) || { count: 0, date: today };

    // Reset counter if new day
    if (usage.date !== today) {
      usage.count = 0;
      usage.date = today;
    }

    // Enforce daily limit
    if (usage.count >= DAILY_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: `Daily limit reached (${DAILY_LIMIT} per day). Upgrade to Premium for unlimited generations!`,
          limitReached: true,
        } as GenerateResponse,
        { status: 429 }
      );
    }

    // Parse request body
    const body: GenerateRequest = await request.json();
    const { text, count = 20 } = body;

    // Validate input
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'No text content provided' } as GenerateResponse,
        { status: 400 }
      );
    }

    if (text.length < 100) {
      return NextResponse.json(
        { success: false, error: 'Text content too short. Please provide at least 100 characters.' } as GenerateResponse,
        { status: 400 }
      );
    }

    // Generate flashcards using Claude Haiku
    const startTime = Date.now();
    const { flashcards, tokensUsed } = await generateFlashcards({
      content: text,
      count,
    });
    const processingTime = Date.now() - startTime;

    // Update usage counter
    usage.count++;
    usageTracker.set(ip, usage);

    // Return success response
    return NextResponse.json({
      success: true,
      flashcards,
      metadata: {
        model: 'claude-3-haiku-20240307',
        tokensUsed,
        processingTime,
        remaining: DAILY_LIMIT - usage.count,
      },
    } as GenerateResponse);
  } catch (error) {
    console.error('Flashcard generation error:', error);

    let errorMessage = 'Failed to generate flashcards';
    if (error instanceof Error) {
      errorMessage = error.message;

      // Provide helpful messages for common errors
      if (errorMessage.includes('not_found_error') || errorMessage.includes('model')) {
        errorMessage = 'AI model not available. Please try again later.';
      } else if (errorMessage.includes('authentication') || errorMessage.includes('api_key')) {
        errorMessage = 'Server configuration error. Please contact support.';
      } else if (errorMessage.includes('rate_limit')) {
        errorMessage = 'Service temporarily busy. Please try again in a moment.';
      } else if (errorMessage.includes('parse')) {
        errorMessage = 'Failed to process AI response. Please try again.';
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      } as GenerateResponse,
      { status: 500 }
    );
  }
}
