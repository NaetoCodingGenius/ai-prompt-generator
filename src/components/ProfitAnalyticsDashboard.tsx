'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Target,
  Percent,
  BarChart3
} from 'lucide-react';
import { MenuAnalysisResult, ProfitAnalysis } from '@/types/menu';
import { Button } from '@/components/ui/button';

interface ProfitAnalyticsDashboardProps {
  analysis: MenuAnalysisResult;
}

export function ProfitAnalyticsDashboard({ analysis }: ProfitAnalyticsDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`;
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 70) return 'text-emerald-600';
    if (margin >= 60) return 'text-green-600';
    if (margin >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRecommendationBadge = (recommendation: string) => {
    const badges = {
      increase_price: { label: 'Increase Price', color: 'bg-emerald-100 text-emerald-700' },
      decrease_price: { label: 'Decrease Price', color: 'bg-blue-100 text-blue-700' },
      remove: { label: 'Consider Removing', color: 'bg-red-100 text-red-700' },
      promote: { label: 'Promote More', color: 'bg-purple-100 text-purple-700' },
      keep: { label: 'Keep As Is', color: 'bg-slate-100 text-slate-700' }
    };

    const badge = badges[recommendation as keyof typeof badges] || badges.keep;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-medium text-emerald-900">Analysis Complete</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900">Your Profit Opportunities</h1>
        <p className="text-lg text-slate-600">Here's how to increase your profits</p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {formatCurrency(analysis.totalMonthlyProfitOpportunity)}
            </div>
            <div className="text-sm text-slate-600">Monthly Profit Opportunity</div>
            <p className="text-xs text-slate-500 mt-2">
              Hidden profit you can capture by following our recommendations
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Percent className="h-6 w-6 text-blue-600" />
              </div>
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {formatPercent(analysis.averageProfitMargin)}
            </div>
            <div className="text-sm text-slate-600">Average Profit Margin</div>
            <p className="text-xs text-slate-500 mt-2">
              {analysis.averageProfitMargin >= 65 ? 'Excellent margins!' : 'Room for improvement'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <CheckCircle2 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-slate-900 mb-1">
              {analysis.totalMenuItems}
            </div>
            <div className="text-sm text-slate-600">Menu Items Analyzed</div>
            <p className="text-xs text-slate-500 mt-2">
              Complete profit breakdown for your entire menu
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profit Killers Alert */}
      {analysis.profitKillers.length > 0 && (
        <Alert className="border-2 border-red-200 bg-red-50">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <AlertDescription className="ml-2">
            <strong className="text-red-900">Warning:</strong> Found{' '}
            <strong className="text-red-900">{analysis.profitKillers.length} profit killer(s)</strong> in your menu.
            These items are costing you money right now!
          </AlertDescription>
        </Alert>
      )}

      {/* Profit Killers */}
      {analysis.profitKillers.length > 0 && (
        <Card className="border-2 border-red-200">
          <CardHeader className="bg-red-50">
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              Profit Killers - Fix These First!
            </CardTitle>
            <CardDescription>
              These items have low margins. Increase prices or remove them from your menu.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {analysis.profitKillers.map((item) => (
                <div key={item.menuItem.id} className="p-4 border-2 border-red-100 rounded-lg bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900">{item.menuItem.name}</h3>
                      <p className="text-sm text-slate-500">{item.menuItem.category}</p>
                    </div>
                    {getRecommendationBadge(item.recommendation)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Current Price</div>
                      <div className="font-semibold">{formatCurrency(item.menuItem.price)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Food Cost</div>
                      <div className="font-semibold">{formatPercent(item.foodCostPercentage)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Profit Margin</div>
                      <div className={`font-semibold ${getMarginColor(item.profitMargin)}`}>
                        {formatPercent(item.profitMargin)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Profit Per Item</div>
                      <div className="font-semibold">{formatCurrency(item.profitPerItem)}</div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-emerald-900 mb-1">Recommendation</div>
                        <div className="text-sm text-emerald-700">{item.recommendationText}</div>
                        {item.potentialMonthlyGain && item.potentialMonthlyGain > 0 && (
                          <div className="text-sm font-semibold text-emerald-900 mt-2">
                            💰 Potential gain: {formatCurrency(item.potentialMonthlyGain)}/month
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* High Margin Winners */}
      {analysis.highMarginItems.length > 0 && (
        <Card className="border-2 border-emerald-200">
          <CardHeader className="bg-emerald-50">
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <TrendingUp className="h-5 w-5" />
              High Margin Winners
            </CardTitle>
            <CardDescription>
              These items are making you the most money. Consider promoting them more!
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {analysis.highMarginItems.slice(0, 5).map((item) => (
                <div key={item.menuItem.id} className="p-4 border-2 border-emerald-100 rounded-lg bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900">{item.menuItem.name}</h3>
                      <p className="text-sm text-slate-500">{item.menuItem.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-600">
                        {formatPercent(item.profitMargin)}
                      </div>
                      <div className="text-xs text-slate-500">profit margin</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Sells For</div>
                      <div className="font-semibold">{formatCurrency(item.menuItem.price)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Costs You</div>
                      <div className="font-semibold">{formatCurrency(item.menuItem.ingredientCost)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Profit Each</div>
                      <div className="font-semibold text-emerald-600">{formatCurrency(item.profitPerItem)}</div>
                    </div>
                  </div>

                  {item.recommendationText && (
                    <div className="mt-3 text-sm text-slate-600 flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{item.recommendationText}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Menu Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Menu Analysis</CardTitle>
          <CardDescription>
            Detailed profit breakdown for all {analysis.totalMenuItems} menu items
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b-2">
                <tr className="text-left">
                  <th className="pb-3 font-semibold">Item</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold text-right">Price</th>
                  <th className="pb-3 font-semibold text-right">Cost</th>
                  <th className="pb-3 font-semibold text-right">Margin</th>
                  <th className="pb-3 font-semibold text-right">Profit</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {analysis.allAnalyses.map((item) => (
                  <tr key={item.menuItem.id} className="hover:bg-slate-50">
                    <td className="py-3 font-medium">{item.menuItem.name}</td>
                    <td className="py-3 text-slate-600">{item.menuItem.category}</td>
                    <td className="py-3 text-right">{formatCurrency(item.menuItem.price)}</td>
                    <td className="py-3 text-right">{formatCurrency(item.menuItem.ingredientCost)}</td>
                    <td className={`py-3 text-right font-semibold ${getMarginColor(item.profitMargin)}`}>
                      {formatPercent(item.profitMargin)}
                    </td>
                    <td className="py-3 text-right font-semibold">{formatCurrency(item.profitPerItem)}</td>
                    <td className="py-3">{getRecommendationBadge(item.recommendation)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 border-0 text-white">
        <CardContent className="py-8 text-center space-y-4">
          <h2 className="text-3xl font-bold">Ready to implement these changes?</h2>
          <p className="text-emerald-50 text-lg max-w-2xl mx-auto">
            This was your free analysis. Sign up for MenuMind AI at $99/month to track your improvements,
            get weekly updates, and maximize your profits.
          </p>
          <Button
            size="lg"
            className="bg-white text-emerald-600 hover:bg-emerald-50 text-lg px-8 py-6"
          >
            Get MenuMind AI - $99/month
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-sm text-emerald-100">
            Month-to-month • Cancel anytime • No contracts
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
