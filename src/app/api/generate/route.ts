import { NextRequest, NextResponse } from 'next/server';
import { generatePrompt } from '@/lib/anthropic';
import { getTemplateById, interpolateTemplate } from '@/lib/templates';
import { GenerateRequest, GenerateResponse } from '@/types/api';

// Simple rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = requestCounts.get(ip);

  if (!limit || now > limit.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }

  if (limit.count >= 10) {
    // 10 requests per minute
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please try again in a minute.' } as GenerateResponse,
        { status: 429 }
      );
    }

    const body: GenerateRequest = await request.json();
    const { templateId, userInput, previousPrompt, refinementFeedback, userApiKey } = body;

    // Validate template
    const template = getTemplateById(templateId);
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' } as GenerateResponse,
        { status: 404 }
      );
    }

    // Validate required parameters
    for (const param of template.parameters) {
      if (param.required && !userInput[param.id]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${param.label}` } as GenerateResponse,
          { status: 400 }
        );
      }
    }

    // Interpolate user inputs into template
    const userPrompt = interpolateTemplate(template.userPromptTemplate, userInput);

    // Call Claude API (use user's key if provided, otherwise use server's key for free tier)
    const { prompt, tokensUsed } = await generatePrompt({
      systemPrompt: template.systemPrompt,
      userPrompt,
      previousPrompt,
      refinementFeedback,
      apiKey: userApiKey,
    });

    return NextResponse.json({
      success: true,
      prompt,
      tokensUsed,
    } as GenerateResponse);
  } catch (error) {
    console.error('Error generating prompt:', error);

    let errorMessage = 'Unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;

      // Provide helpful messages for common errors
      if (errorMessage.includes('not_found_error')) {
        errorMessage = 'The AI model is not available. Please check your API key has access to Claude models.';
      } else if (errorMessage.includes('authentication')) {
        errorMessage = 'API key authentication failed. Please verify your API key in .env.local';
      } else if (errorMessage.includes('rate_limit')) {
        errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
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
