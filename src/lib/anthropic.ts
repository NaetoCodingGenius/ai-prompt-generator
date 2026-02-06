import Anthropic from '@anthropic-ai/sdk';

export interface GeneratePromptOptions {
  systemPrompt: string;
  userPrompt: string;
  previousPrompt?: string;
  refinementFeedback?: string;
  apiKey?: string;
}

export async function generatePrompt(
  options: GeneratePromptOptions
): Promise<{ prompt: string; tokensUsed: number }> {
  const { systemPrompt, userPrompt, previousPrompt, refinementFeedback, apiKey } = options;

  // Use user's API key if provided, otherwise use server's key
  const client = new Anthropic({
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
  });

  let fullUserPrompt = userPrompt;

  if (previousPrompt && refinementFeedback) {
    fullUserPrompt = `
Previous prompt that was generated:
${previousPrompt}

User feedback for refinement:
${refinementFeedback}

Please improve and refine the prompt based on this feedback while maintaining its core purpose and structure. Make it better suited to the user's needs.
`;
  }

  const message = await client.messages.create({
    model: 'claude-opus-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: fullUserPrompt,
      },
    ],
  });

  const content = message.content[0];
  const promptText = content.type === 'text' ? content.text : '';

  return {
    prompt: promptText,
    tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
  };
}
