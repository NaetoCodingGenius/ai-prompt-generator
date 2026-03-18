import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { MenuItem } from '@/types/menu';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { menuItems } = await request.json();

    if (!menuItems || !Array.isArray(menuItems) || menuItems.length === 0) {
      return NextResponse.json(
        { error: 'Invalid menu items provided' },
        { status: 400 }
      );
    }

    // Format menu data for Claude
    const menuData = menuItems.map((item: MenuItem) => ({
      name: item.name,
      category: item.category,
      price: item.price,
      cost: item.ingredientCost,
      margin: ((item.price - item.ingredientCost) / item.price * 100).toFixed(1),
      profitPerItem: (item.price - item.ingredientCost).toFixed(2)
    }));

    const prompt = `You are an expert restaurant menu engineer and profit optimization consultant. Analyze this restaurant menu and provide actionable recommendations to maximize profitability.

Menu Data:
${JSON.stringify(menuData, null, 2)}

Please analyze:
1. Overall menu health and average profit margins
2. Identify "profit killers" (items with margins below 50%)
3. Identify "high margin winners" (items with margins above 65%)
4. Specific pricing recommendations for low-margin items
5. Strategic recommendations (which items to promote, remove, or reprice)
6. Estimated monthly profit opportunity if recommendations are followed

Industry standards:
- Target profit margin: 65-70%
- Minimum acceptable margin: 50%
- Food cost should be 28-35% of price

Provide your response in this exact JSON format:
{
  "overallAssessment": "Brief overall assessment of menu health",
  "averageMargin": number,
  "profitKillers": [
    {
      "itemName": "name",
      "currentMargin": number,
      "issue": "what's wrong",
      "recommendation": "specific action to take",
      "potentialGain": number (monthly estimate)
    }
  ],
  "highMarginWinners": [
    {
      "itemName": "name",
      "margin": number,
      "recommendation": "how to leverage this item"
    }
  ],
  "strategicRecommendations": [
    "recommendation 1",
    "recommendation 2",
    "recommendation 3"
  ],
  "totalMonthlyOpportunity": number,
  "quickWins": [
    {
      "action": "specific quick action",
      "expectedImpact": "what will this achieve"
    }
  ]
}

Return ONLY valid JSON, no markdown or additional text.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse the JSON response from Claude
    let aiAnalysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: aiAnalysis,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens
    });

  } catch (error) {
    console.error('Menu analysis error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze menu',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
