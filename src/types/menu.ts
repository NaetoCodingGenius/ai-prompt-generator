export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  ingredientCost: number;
  popularityScore?: number; // 1-10 based on sales data (optional for MVP)
}

export interface ProfitAnalysis {
  menuItem: MenuItem;
  profitMargin: number; // percentage
  profitPerItem: number; // dollars
  grossProfit: number; // dollars
  foodCostPercentage: number;
  recommendation: 'increase_price' | 'decrease_price' | 'remove' | 'promote' | 'keep';
  recommendationText: string;
  potentialMonthlyGain?: number; // If they follow recommendation
}

export interface MenuAnalysisResult {
  totalMenuItems: number;
  averageProfitMargin: number;
  totalMonthlyProfitOpportunity: number;
  highMarginItems: ProfitAnalysis[];
  lowMarginItems: ProfitAnalysis[];
  profitKillers: ProfitAnalysis[]; // Popular but unprofitable
  hiddenGems: ProfitAnalysis[]; // Unpopular but profitable
  allAnalyses: ProfitAnalysis[];
  generatedAt: number;
}

export interface RestaurantProfile {
  id: string;
  name: string;
  createdAt: number;
  lastAnalysis?: MenuAnalysisResult;
}
