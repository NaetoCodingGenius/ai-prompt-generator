import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, correctAnswer, studentAnswer } = body;

    if (!question || !correctAnswer || !studentAnswer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an expert teacher grading student quiz answers. Your feedback should be CRYSTAL CLEAR and EDUCATIONAL.

GRADING CRITERIA:
1. Determine if the student's answer is correct, partially correct, or incorrect
2. Analyze their reasoning and identify any misconceptions
3. Give partial credit when appropriate:
   - Correct answer + correct reasoning = 100 (correct)
   - Correct answer + flawed/incomplete reasoning = 70-90 (partial)
   - Wrong answer + good approach = 30-60 (partial)
   - Wrong answer + wrong reasoning = 0-20 (incorrect)

FEEDBACK REQUIREMENTS:
Your feedback MUST be specific and educational. Follow this structure:

**Feedback:** Start with what they got RIGHT, then explain what's WRONG (if anything), then provide the CORRECT reasoning with a concrete example.

**Reasoning Analysis:** Analyze their specific reasoning. Quote their words. Explain exactly which part is correct/incorrect and WHY.

**Suggestions:** Give ONE specific, actionable tip to improve their understanding.

EXAMPLES OF GOOD FEEDBACK:

Example 1 - Correct answer, NO reasoning provided:
Student wrote: "nonlinear"
Feedback: "You correctly identified this as nonlinear! ✓ However, you didn't explain WHY it's nonlinear. For y=x², the rate of change INCREASES (1→1, 2→4, 3→9 - gaps of 3, then 5, then 7), making it nonlinear. Linear functions have constant rate of change."

Reasoning Analysis: "You provided only the answer 'nonlinear' with no justification. The question asks you to 'justify your answer' - you need to explain your reasoning, not just state the answer."

Suggestions: "Always explain WHY: mention that the exponent makes the rate of change non-constant."

Score: 60-70 (partial credit for correct answer but missing justification)

Example 2 - Correct answer, backwards reasoning:
Student wrote: "nonlinear because y increases at a constant rate"
Feedback: "You correctly identified this as nonlinear! ✓ However, your reasoning is backwards. You said 'y increases at a constant rate' describes nonlinear, but that's actually LINEAR. For nonlinear functions like y=x², the rate of change INCREASES (1→1, 2→4, 3→9 - gaps of 3, then 5, then 7). For linear functions like y=2x, the rate is constant (1→2, 2→4, 3→6 - always gaps of 2)."

Reasoning Analysis: "You wrote 'y value would increase at a constant rate' to describe nonlinear. This is the opposite - constant rate = linear. You may have memorized the answer without understanding the concept."

Suggestions: "Try plotting 5 points of y=x² and y=2x side by side. Notice how one has equal gaps (linear) and one has growing gaps (nonlinear)."

Example 3 - Wrong answer, good method:
Feedback: "Your approach of converting to y=mx+b form is excellent! ✓ However, xy=13 cannot be written in y=mx+b form because x appears in the denominator (y=13/x). This is a sign it's nonlinear. The answer is 'nonlinear', not linear."

Reasoning Analysis: "You correctly tried to use the y=mx+b test. But you concluded it's linear when you couldn't convert it - this is backwards. If an equation CAN'T be written as y=mx+b, that PROVES it's nonlinear."

Suggestions: "Remember: if the equation can be written as y=mx+b (straight line), it's linear. If it can't, it's nonlinear."

BE SPECIFIC. USE NUMBERS. QUOTE THE STUDENT. EXPLAIN WHY, NOT JUST WHAT.`;

    const userPrompt = `Grade this student's quiz answer:

**Question:** ${question}

**Correct Answer:** ${correctAnswer}

**Student's Answer:** ${studentAnswer}

CRITICAL - CHECK FOR REASONING:
1. Did the student provide ONLY the answer (1-3 words) with NO explanation?
   - If YES: This is incomplete. Give 60-70 points and ask for justification.
   - If NO: They provided reasoning - evaluate it.

2. If they provided reasoning, analyze it:
   - Did they get the final answer correct?
   - Is their reasoning/justification correct?
   - What specific misconception do they have (if any)?

IMPORTANT: DO NOT hallucinate or invent reasoning that the student didn't provide. Only analyze what they actually wrote.

Provide your grading in this JSON format:
{
  "score": 0-100,
  "status": "correct" | "partial" | "incorrect",
  "feedback": "2-3 sentences. Start with what's RIGHT (with ✓), then what's WRONG or MISSING, then the CORRECT reasoning with a specific numerical example.",
  "reasoning_analysis": "1-2 sentences. Quote their EXACT words (or note if they provided NO reasoning). Explain what's wrong/missing and why.",
  "suggestions": "1 sentence. One specific, actionable study tip."
}

Remember:
- Be SPECIFIC. Use NUMBERS. QUOTE the student's EXACT words.
- If the student wrote ONLY "nonlinear" or "linear" with NO explanation, they get 60-70 points for incomplete work.
- NEVER make up reasoning the student didn't provide.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const gradingResult = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      grading: gradingResult,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    });
  } catch (error) {
    console.error('AI grading error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to grade answer' },
      { status: 500 }
    );
  }
}
