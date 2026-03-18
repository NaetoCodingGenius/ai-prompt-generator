import { MenuItem, MenuAnalysisResult, ProfitAnalysis } from '@/types/menu';

export function analyzeMenu(menuItems: MenuItem[]): MenuAnalysisResult {
  const analyses: ProfitAnalysis[] = menuItems.map(item => {
    const profitPerItem = item.price - item.ingredientCost;
    const profitMargin = (profitPerItem / item.price) * 100;
    const foodCostPercentage = (item.ingredientCost / item.price) * 100;

    // Determine recommendation
    let recommendation: ProfitAnalysis['recommendation'];
    let recommendationText: string;
    let potentialMonthlyGain: number | undefined;

    if (profitMargin < 50) {
      // Low margin - needs price increase or removal
      const targetMargin = 65; // Industry standard
      const targetPrice = item.ingredientCost / (1 - targetMargin / 100);
      const priceIncrease = targetPrice - item.price;

      if (priceIncrease > item.price * 0.3) {
        // If price increase needed is > 30%, recommend removal
        recommendation = 'remove';
        recommendationText = `This item has a ${profitMargin.toFixed(1)}% margin (below 50%). The price increase needed would be too high. Consider removing it or finding cheaper ingredients.`;
      } else {
        recommendation = 'increase_price';
        recommendationText = `Increase price from $${item.price.toFixed(2)} to $${targetPrice.toFixed(2)} (${((priceIncrease / item.price) * 100).toFixed(0)}% increase) to achieve a healthy 65% margin.`;

        // Estimate monthly gain (assuming 100 sales/month)
        const averageMonthlySales = 100;
        const currentMonthlyProfit = profitPerItem * averageMonthlySales;
        const targetProfitPerItem = targetPrice - item.ingredientCost;
        const targetMonthlyProfit = targetProfitPerItem * averageMonthlySales;
        potentialMonthlyGain = targetMonthlyProfit - currentMonthlyProfit;
      }
    } else if (profitMargin >= 50 && profitMargin < 60) {
      // Decent margin but could be better
      recommendation = 'increase_price';
      const targetPrice = item.price * 1.10; // 10% increase
      recommendationText = `Good margin, but you could increase price by $${(targetPrice - item.price).toFixed(2)} to boost profits without losing customers.`;

      const averageMonthlySales = 100;
      const targetProfitPerItem = targetPrice - item.ingredientCost;
      potentialMonthlyGain = (targetProfitPerItem - profitPerItem) * averageMonthlySales;
    } else if (profitMargin >= 60 && profitMargin < 75) {
      // Good margin
      recommendation = 'promote';
      recommendationText = `Excellent ${profitMargin.toFixed(1)}% margin! Promote this item more to increase sales and overall profit.`;
    } else {
      // Excellent margin (75%+)
      recommendation = 'promote';
      recommendationText = `Outstanding ${profitMargin.toFixed(1)}% margin! This is a top performer. Feature it prominently and train staff to upsell it.`;
    }

    return {
      menuItem: item,
      profitMargin,
      profitPerItem,
      grossProfit: profitPerItem * 100, // Assuming 100 sales/month for demo
      foodCostPercentage,
      recommendation,
      recommendationText,
      potentialMonthlyGain
    };
  });

  // Sort analyses
  const sortedByMargin = [...analyses].sort((a, b) => b.profitMargin - a.profitMargin);

  // Calculate metrics
  const averageProfitMargin = analyses.reduce((sum, a) => sum + a.profitMargin, 0) / analyses.length;

  // Categorize items
  const highMarginItems = sortedByMargin.filter(a => a.profitMargin >= 65);
  const lowMarginItems = sortedByMargin.filter(a => a.profitMargin < 60);
  const profitKillers = sortedByMargin.filter(a => a.profitMargin < 50);

  // Calculate total potential gain
  const totalMonthlyProfitOpportunity = analyses
    .filter(a => a.potentialMonthlyGain && a.potentialMonthlyGain > 0)
    .reduce((sum, a) => sum + (a.potentialMonthlyGain || 0), 0);

  return {
    totalMenuItems: menuItems.length,
    averageProfitMargin,
    totalMonthlyProfitOpportunity,
    highMarginItems,
    lowMarginItems,
    profitKillers,
    hiddenGems: [], // Could add logic for this later
    allAnalyses: sortedByMargin,
    generatedAt: Date.now()
  };
}
