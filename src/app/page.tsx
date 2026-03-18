'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  ArrowRight,
  Upload,
  BarChart3,
  Zap,
  Target,
  Star,
  Shield,
  Users,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { MenuUpload } from '@/components/MenuUpload';
import { ProfitAnalyticsDashboard } from '@/components/ProfitAnalyticsDashboard';
import { MenuItem, MenuAnalysisResult } from '@/types/menu';
import { analyzeMenu } from '@/lib/menuAnalysis';
import { AnimatedSection, FadeIn, SlideInLeft, SlideInRight } from '@/components/AnimatedSection';

export default function Home() {
  const [showUpload, setShowUpload] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<MenuAnalysisResult | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleAnalysisComplete = (menuItems: MenuItem[]) => {
    const result = analyzeMenu(menuItems);
    setAnalysisResult(result);
    toast.success(`Analysis complete! Found $${result.totalMonthlyProfitOpportunity.toFixed(0)}+ in monthly opportunities`);
  };

  const handleStartOver = () => {
    setShowUpload(true);
    setAnalysisResult(null);
  };

  const faqs = [
    {
      question: "How does MenuMind AI calculate profit margins?",
      answer: "We use industry-standard menu engineering formulas: (Selling Price - Ingredient Cost) / Selling Price × 100. Our AI then analyzes your entire menu to identify patterns, opportunities, and provides specific recommendations based on proven restaurant profit optimization strategies."
    },
    {
      question: "Do I need to integrate with my POS system?",
      answer: "No! Unlike enterprise tools that require complex POS integrations taking months, MenuMind works with simple CSV uploads or manual entry. Just enter your menu items and costs - we'll handle the analysis. This means you can get started in 5 minutes, not 5 months."
    },
    {
      question: "What if I don't know my exact ingredient costs?",
      answer: "Start with estimates! Even rough ingredient costs will reveal valuable insights. As you refine your numbers over time, your analysis becomes more accurate. Most restaurant owners are surprised to find they're off by 20-30% on their cost estimates."
    },
    {
      question: "How much profit can I realistically expect to gain?",
      answer: "Our beta users have seen 10-20% profit increases by following our recommendations. For a restaurant doing $50k/month in revenue with 65% food costs, that's $5,000-10,000 more profit annually. Individual results vary based on current pricing strategy and menu complexity."
    },
    {
      question: "Is this just for restaurants or can other food businesses use it?",
      answer: "MenuMind works for any food business with a menu: restaurants, cafes, food trucks, catering companies, bakeries, juice bars, and more. If you sell food and want to maximize profit margins, this tool is for you."
    },
    {
      question: "Can I cancel anytime?",
      answer: "Yes! Unlike enterprise tools with annual contracts, MenuMind is month-to-month. Cancel anytime with one click. No questions asked, no penalties. We only keep customers who are making more money with us."
    },
    {
      question: "How is this different from spreadsheets?",
      answer: "Spreadsheets require manual formulas, updates, and analysis. MenuMind automatically calculates margins, identifies profit killers, suggests optimal pricing, and shows you exactly how much money you're leaving on the table - all in seconds. Plus, we track changes over time so you can see your profit improvements."
    },
    {
      question: "Do you offer support?",
      answer: "Yes! Every plan includes email support. We typically respond within 24 hours on weekdays. We also have video tutorials and a knowledge base to help you get the most out of MenuMind."
    }
  ];

  const testimonials = [
    {
      name: "Marco R.",
      business: "Italian Bistro, Seattle",
      quote: "Found $3,200/month in hidden profit in the first week. My lasagna was actually losing me money! Increased the price by $3 and customers didn't even notice.",
      rating: 5
    },
    {
      name: "Sarah K.",
      business: "Cafe & Bakery, Portland",
      quote: "Way simpler than the $400/month tool we tried before. I'm not tech-savvy but I had my whole menu analyzed in 10 minutes. Worth every penny.",
      rating: 5
    },
    {
      name: "David L.",
      business: "Thai Restaurant, Austin",
      quote: "The profit killer alerts opened my eyes. Three of our 'bestsellers' had margins under 45%. Made pricing changes and profit jumped 18% in one month.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">MenuMind AI</span>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              How It Works
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Pricing
            </a>
            <a
              href="/resources"
              className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
            >
              Resources
            </a>
          </nav>

          <Button
            variant="default"
            className="bg-emerald-600 hover:bg-emerald-700 transition-all hover:scale-105"
            onClick={() => setShowUpload(true)}
          >
            Get Started
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {!showUpload ? (
        <>
          {/* Hero Section */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Text Content */}
              <FadeIn>
                <div className="space-y-8">
                  {/* Pill Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 animate-pulse">
                    <Zap className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-900">
                      Find $1,000+ in hidden profit in 5 minutes
                    </span>
                  </div>

                  {/* Headline - LARGER */}
                  <h1 className="font-[family-name:var(--font-inter)] text-5xl sm:text-7xl font-extrabold text-slate-900 leading-tight tracking-tight">
                    See which menu items are
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                      killing your profits
                    </span>
                  </h1>

                  {/* Subheadline */}
                  <p className="text-xl sm:text-2xl text-slate-600 leading-relaxed">
                    AI-powered menu engineering for independent restaurants.
                    <span className="font-semibold text-slate-900"> $99/month</span>, not $4,000/year.
                  </p>

                  {/* CTA */}
                  <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
                    <Button
                      size="lg"
                      className="bg-emerald-600 hover:bg-emerald-700 text-lg px-8 py-6 transition-all hover:scale-105 hover:shadow-lg"
                      onClick={() => setShowUpload(true)}
                    >
                      Analyze My Menu - Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <p className="text-sm text-slate-500 pt-3">
                      No credit card required • Results in 5 minutes
                    </p>
                  </div>
                </div>
              </FadeIn>

              {/* Right Column - Hero Visual Mockup */}
              <SlideInRight delay={200}>
                <div className="relative">
                  {/* Dashboard Mockup */}
                  <div className="rounded-2xl bg-white shadow-2xl border-2 border-emerald-100 overflow-hidden">
                    {/* Mock Browser Bar */}
                    <div className="bg-slate-100 px-4 py-3 border-b flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="h-3 w-3 rounded-full bg-red-400"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
                        <div className="h-3 w-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-slate-400">
                        menumind.ai/dashboard
                      </div>
                    </div>

                    {/* Dashboard Content */}
                    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white">
                      {/* Top Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-4 border border-emerald-200">
                          <div className="text-xs text-emerald-700 font-medium mb-1">Profit Opportunity</div>
                          <div className="text-2xl font-bold text-emerald-900">$3,240/mo</div>
                          <div className="text-xs text-emerald-600 mt-1">↑ Found in your menu</div>
                        </div>
                        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                          <div className="text-xs text-slate-600 font-medium mb-1">Avg Margin</div>
                          <div className="text-2xl font-bold text-slate-900">58.2%</div>
                          <div className="text-xs text-slate-500 mt-1">Target: 65%</div>
                        </div>
                      </div>

                      {/* Profit Killers Alert */}
                      <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                          <span className="text-xs font-semibold text-red-900">3 Profit Killers Found</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-red-800">Truffle Pasta</span>
                            <span className="font-semibold text-red-600">38% margin</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-red-800">Lobster Risotto</span>
                            <span className="font-semibold text-red-600">42% margin</span>
                          </div>
                        </div>
                      </div>

                      {/* Top Performers */}
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-slate-700">Top Performers</div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: '82%' }}></div>
                            </div>
                            <span className="text-xs font-semibold text-emerald-600">82%</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: '75%' }}></div>
                            </div>
                            <span className="text-xs font-semibold text-emerald-600">75%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Badge */}
                  <div className="absolute -bottom-4 -right-4 bg-white shadow-lg rounded-full px-4 py-2 border-2 border-emerald-500">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-slate-900">Live Analysis</span>
                    </div>
                  </div>
                </div>
              </SlideInRight>
            </div>

            {/* Stats */}
            <AnimatedSection delay={200}>
              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-16">
                <div className="text-center space-y-2 p-6 rounded-lg bg-white border-2 hover:border-emerald-200 transition-all hover:shadow-lg">
                  <div className="text-4xl font-bold text-emerald-600">10-20%</div>
                  <div className="text-slate-600">Average profit increase</div>
                </div>
                <div className="text-center space-y-2 p-6 rounded-lg bg-white border-2 hover:border-emerald-200 transition-all hover:shadow-lg">
                  <div className="text-4xl font-bold text-emerald-600">5 min</div>
                  <div className="text-slate-600">Setup time</div>
                </div>
                <div className="text-center space-y-2 p-6 rounded-lg bg-white border-2 hover:border-emerald-200 transition-all hover:shadow-lg">
                  <div className="text-4xl font-bold text-emerald-600">$99</div>
                  <div className="text-slate-600">Per month</div>
                </div>
              </div>
            </AnimatedSection>
          </section>

          {/* Dashboard Preview */}
          <AnimatedSection>
            <section className="bg-gradient-to-b from-emerald-50 to-white py-20">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="font-[family-name:var(--font-inter)] text-4xl font-bold text-slate-900 mb-3 tracking-tight">
                    See your profits at a glance
                  </h2>
                  <p className="text-lg text-slate-600">
                    Professional analytics dashboard built for restaurant owners
                  </p>
                </div>

                <div className="rounded-2xl bg-white shadow-2xl border-2 border-emerald-100 overflow-hidden">
                  {/* Full Dashboard Mockup */}
                  <div className="p-8 space-y-6 bg-gradient-to-br from-white to-slate-50">
                    {/* Header Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-emerald-100 text-sm font-medium">Monthly Opportunity</span>
                          <TrendingUp className="h-5 w-5 text-emerald-100" />
                        </div>
                        <div className="text-4xl font-bold mb-1">$3,240</div>
                        <div className="text-emerald-100 text-sm">Hidden profit identified</div>
                      </div>

                      <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-600 text-sm font-medium">Average Margin</span>
                          <BarChart3 className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="text-4xl font-bold text-slate-900 mb-1">58.2%</div>
                        <div className="text-slate-500 text-sm">Target: 65% industry standard</div>
                      </div>

                      <div className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-600 text-sm font-medium">Items Analyzed</span>
                          <Target className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="text-4xl font-bold text-slate-900 mb-1">24</div>
                        <div className="text-slate-500 text-sm">Menu items tracked</div>
                      </div>
                    </div>

                    {/* Profit Killers Alert */}
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-red-900 text-lg">3 Profit Killers Found</h3>
                          <p className="text-red-700 text-sm">These items are losing you money</p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-100">
                          <div>
                            <div className="font-semibold text-slate-900">Truffle Pasta</div>
                            <div className="text-xs text-slate-500">$24 • Cost: $14.88</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-red-600">38%</div>
                            <div className="text-xs text-red-500">Below 50%</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-100">
                          <div>
                            <div className="font-semibold text-slate-900">Lobster Risotto</div>
                            <div className="text-xs text-slate-500">$32 • Cost: $18.56</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-red-600">42%</div>
                            <div className="text-xs text-red-500">Below 50%</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Top Performers */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                        <h3 className="font-bold text-emerald-900 text-lg mb-4 flex items-center gap-2">
                          <Star className="h-5 w-5 fill-emerald-500 text-emerald-500" />
                          High Margin Winners
                        </h3>
                        <div className="space-y-3">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-700">Margherita Pizza</span>
                              <span className="font-bold text-emerald-600">75%</span>
                            </div>
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: '75%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-700">House Salad</span>
                              <span className="font-bold text-emerald-600">82%</span>
                            </div>
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: '82%' }}></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-slate-700">Lemonade</span>
                              <span className="font-bold text-emerald-600">88%</span>
                            </div>
                            <div className="h-2 bg-white rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: '88%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
                        <h3 className="font-bold text-slate-900 text-lg mb-4">Quick Recommendations</h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex gap-3 items-start">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-slate-900">Promote House Salad</div>
                              <div className="text-slate-500 text-xs">82% margin - train staff to upsell</div>
                            </div>
                          </div>
                          <div className="flex gap-3 items-start">
                            <ArrowRight className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-slate-900">Increase Truffle Pasta to $28</div>
                              <div className="text-slate-500 text-xs">+$400/month potential gain</div>
                            </div>
                          </div>
                          <div className="flex gap-3 items-start">
                            <Target className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <div className="font-medium text-slate-900">Review supplier costs</div>
                              <div className="text-slate-500 text-xs">3 items have rising ingredient costs</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </AnimatedSection>

          {/* Trust Badges */}
          <AnimatedSection>
            <section className="bg-white border-y py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-wrap items-center justify-center gap-8 text-slate-400">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <span className="text-sm font-medium">Bank-Level Security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span className="text-sm font-medium">100+ Restaurants</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    <span className="text-sm font-medium">4.9/5 Average Rating</span>
                  </div>
                </div>
              </div>
            </section>
          </AnimatedSection>

          {/* Problem Section with Visual */}
          <AnimatedSection>
            <section className="bg-gradient-to-b from-white via-rose-50/30 to-white py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h2 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      75% of restaurants don't know their real margins
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      Most menu engineering tools cost <span className="font-semibold text-slate-900">$330+/month</span> and take <span className="font-semibold text-slate-900">3-6 months</span> to set up.
                    </p>
                    <p className="text-lg text-slate-600 leading-relaxed">
                      That's why independent restaurants are left using spreadsheets or guessing at prices.
                    </p>
                  </div>
                  <div className="rounded-xl bg-gradient-to-br from-red-50 to-rose-100 p-8 border-2 border-red-100">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-red-700">
                        <TrendingDown className="h-8 w-8" />
                        <span className="text-2xl font-bold">$2,400/month</span>
                      </div>
                      <p className="text-red-900 font-medium">Average profit lost from poor menu pricing</p>
                      <div className="pt-4 border-t border-red-200 text-sm text-red-700">
                        Without data, restaurants lose 10-20% of potential profit
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </AnimatedSection>

          {/* How It Works */}
          <section id="how-it-works" className="bg-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <AnimatedSection>
                <div className="text-center mb-12">
                  <h2 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Simple, fast, and actually affordable
                  </h2>
                  <p className="text-xl text-slate-600">
                    No POS integration. No complicated setup. Just results.
                  </p>
                </div>
              </AnimatedSection>

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <SlideInLeft delay={0}>
                <Card className="border-2 hover:border-emerald-200 transition-all hover:shadow-lg h-full overflow-hidden">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                      <Upload className="h-6 w-6 text-emerald-600" />
                    </div>
                    <CardTitle>1. Upload Menu</CardTitle>
                    <CardDescription>
                      CSV or manual entry. Add your menu items and ingredient costs in minutes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Upload Interface Mockup */}
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                      <div className="space-y-2 text-xs">
                        <div className="grid grid-cols-3 gap-2 font-medium text-slate-600 pb-2 border-b">
                          <span>Item</span>
                          <span>Price</span>
                          <span>Cost</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-slate-700">
                          <span>Pizza</span>
                          <span>$14</span>
                          <span>$3.50</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-slate-700">
                          <span>Salad</span>
                          <span>$9</span>
                          <span>$1.62</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-slate-400">
                          <span>+ Add item</span>
                          <span>—</span>
                          <span>—</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SlideInLeft>

              <SlideInLeft delay={100}>
                <Card className="border-2 hover:border-emerald-200 transition-all hover:shadow-lg h-full overflow-hidden">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                      <BarChart3 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <CardTitle>2. AI Analyzes</CardTitle>
                    <CardDescription>
                      Our AI calculates profit margins and identifies which dishes are costing you money.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Analysis Interface Mockup */}
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
                      <div className="text-center mb-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-medium">
                          <Zap className="h-3 w-3" />
                          Analyzing...
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs text-slate-700">Profit margins calculated</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span className="text-xs text-slate-700">Opportunities identified</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"></div>
                          <span className="text-xs text-slate-700">Generating recommendations...</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SlideInLeft>

              <SlideInLeft delay={200}>
                <Card className="border-2 hover:border-emerald-200 transition-all hover:shadow-lg h-full overflow-hidden">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                      <Target className="h-6 w-6 text-emerald-600" />
                    </div>
                    <CardTitle>3. Get Recommendations</CardTitle>
                    <CardDescription>
                      See exactly which prices to change and how much profit you'll gain.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* Recommendations Interface Mockup */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                      <div className="space-y-2">
                        <div className="bg-white rounded p-2 text-xs">
                          <div className="font-semibold text-slate-900 mb-1">Truffle Pasta</div>
                          <div className="text-emerald-600 font-medium">↑ Increase to $28</div>
                          <div className="text-slate-500">+$400/mo</div>
                        </div>
                        <div className="bg-white rounded p-2 text-xs">
                          <div className="font-semibold text-slate-900 mb-1">House Salad</div>
                          <div className="text-blue-600 font-medium">★ Promote more</div>
                          <div className="text-slate-500">82% margin</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </SlideInLeft>
              </div>

              {/* Visual Process Flow */}
              <AnimatedSection delay={400}>
                <div className="mt-16 max-w-4xl mx-auto">
                  <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 p-8 border-2 border-emerald-100">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 text-center">
                        <div className="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                        <div className="text-sm text-emerald-900 font-medium">Upload</div>
                      </div>
                      <ArrowRight className="h-6 w-6 text-emerald-400" />
                      <div className="flex-1 text-center">
                        <div className="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                        <div className="text-sm text-emerald-900 font-medium">Analyze</div>
                      </div>
                      <ArrowRight className="h-6 w-6 text-emerald-400" />
                      <div className="flex-1 text-center">
                        <div className="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                        <div className="text-sm text-emerald-900 font-medium">Profit</div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </section>

          {/* Testimonials */}
          <AnimatedSection>
            <section className="bg-slate-50 py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Trusted by restaurant owners
                  </h2>
                  <p className="text-xl text-slate-600">
                    See what other independent restaurants are saying
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                  {testimonials.map((testimonial, index) => (
                    <FadeIn key={index} delay={index * 100}>
                      <Card className="border-2 hover:shadow-lg transition-all h-full">
                        <CardContent className="pt-6">
                          <div className="flex gap-1 mb-4">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <p className="text-slate-700 mb-4 italic">"{testimonial.quote}"</p>
                          <div className="border-t pt-4">
                            <div className="font-semibold text-slate-900">{testimonial.name}</div>
                            <div className="text-sm text-slate-500">{testimonial.business}</div>
                          </div>
                        </CardContent>
                      </Card>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </section>
          </AnimatedSection>

          {/* Features with Screenshots */}
          <AnimatedSection>
            <section id="features" className="bg-gradient-to-b from-slate-50 to-white py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Everything you need to maximize profit
                  </h2>
                </div>

                {/* Visual Demo - Profit Margin Bar Chart */}
                <div className="mb-16 max-w-3xl mx-auto">
                  <div className="rounded-xl bg-white border-2 border-emerald-100 p-8 shadow-lg">
                    <div className="space-y-4">
                      <div className="text-sm font-medium text-slate-700">Profit Margin Analysis</div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-600">Margherita Pizza</span>
                            <span className="text-sm font-semibold text-emerald-600">75%</span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: '75%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-600">Caesar Salad</span>
                            <span className="text-sm font-semibold text-green-600">62%</span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-green-500 to-green-600" style={{ width: '62%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-slate-600">Truffle Pasta</span>
                            <span className="text-sm font-semibold text-red-600">38%</span>
                          </div>
                          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-red-500 to-red-600" style={{ width: '38%' }}></div>
                          </div>
                        </div>
                      </div>
                      <div className="pt-3 border-t text-xs text-slate-500">
                        Instant visibility into which items drive profit
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {[
                    {
                      icon: DollarSign,
                      title: 'Profit Margin Analysis',
                      description: 'See exact profit margin for every menu item'
                    },
                    {
                      icon: TrendingUp,
                      title: 'Pricing Recommendations',
                      description: 'AI suggests optimal prices based on your costs'
                    },
                    {
                      icon: Target,
                      title: 'Profit Killers Identified',
                      description: 'Find popular dishes that are actually losing you money'
                    },
                    {
                      icon: Clock,
                      title: 'Weekly Reports',
                      description: 'Track profit improvements over time'
                    },
                    {
                      icon: BarChart3,
                      title: 'Visual Analytics',
                      description: 'Professional dashboards that are easy to understand'
                    },
                    {
                      icon: Zap,
                      title: 'Instant Results',
                      description: 'See opportunities in minutes, not months'
                    }
                  ].map((feature, index) => (
                    <FadeIn key={index} delay={index * 50}>
                      <div className="flex gap-4 p-4 bg-white rounded-lg border-2 hover:border-emerald-200 transition-all hover:shadow-md">
                        <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <feature.icon className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                          <p className="text-sm text-slate-600">{feature.description}</p>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </section>
          </AnimatedSection>

          {/* Comparison */}
          <AnimatedSection>
            <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="text-center mb-12">
                <h2 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                  How we compare
                </h2>
              </div>

              {/* Price Comparison Visual */}
              <div className="mb-12 max-w-2xl mx-auto">
                <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 p-8">
                  <div className="text-center mb-6">
                    <div className="text-sm font-medium text-emerald-900 mb-1">Annual Cost Comparison</div>
                    <div className="text-xs text-emerald-700">Save $2,772/year</div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700">Enterprise Tools</span>
                        <span className="text-lg font-bold text-slate-900">$3,960/yr</span>
                      </div>
                      <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-slate-400 to-slate-500" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-emerald-700">MenuMind AI</span>
                        <span className="text-lg font-bold text-emerald-600">$1,188/yr</span>
                      </div>
                      <div className="h-4 bg-white rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Competitors */}
                <SlideInLeft>
                  <Card className="border-2 h-full">
                    <CardHeader>
                      <CardTitle className="text-xl">Enterprise Tools</CardTitle>
                      <CardDescription>MarginEdge, Supy, etc.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2 text-slate-600">
                        <div className="text-red-500 mt-0.5">✕</div>
                        <span>$330+/month pricing</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600">
                        <div className="text-red-500 mt-0.5">✕</div>
                        <span>3-6 month implementation</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600">
                        <div className="text-red-500 mt-0.5">✕</div>
                        <span>Complex staff training required</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600">
                        <div className="text-red-500 mt-0.5">✕</div>
                        <span>Built for chains, not independents</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-600">
                        <div className="text-red-500 mt-0.5">✕</div>
                        <span>Annual contracts</span>
                      </div>
                    </CardContent>
                  </Card>
                </SlideInLeft>

                {/* MenuMind */}
                <SlideInRight>
                  <Card className="border-2 border-emerald-500 relative h-full">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-emerald-500 text-white text-sm font-medium rounded-full">
                      MenuMind AI
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl">Built for You</CardTitle>
                      <CardDescription>Independent restaurants</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start gap-2 text-slate-900">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">$99/month</span> - 70% cheaper</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-900">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span><span className="font-semibold">5 minute</span> setup</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-900">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>No training needed - stupid simple</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-900">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>Perfect for 1-3 location restaurants</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-900">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>Month-to-month, cancel anytime</span>
                      </div>
                    </CardContent>
                  </Card>
                </SlideInRight>
              </div>
            </section>
          </AnimatedSection>

          {/* FAQs */}
          <AnimatedSection>
            <section className="bg-white py-20">
              <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                  <h2 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                    Frequently Asked Questions
                  </h2>
                  <p className="text-xl text-slate-600">
                    Everything you need to know about MenuMind AI
                  </p>
                </div>

                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <FadeIn key={index} delay={index * 50}>
                      <div className="bg-white rounded-lg border-2 overflow-hidden hover:border-emerald-200 transition-all">
                        <button
                          onClick={() => setOpenFaq(openFaq === index ? null : index)}
                          className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                          <span className="font-semibold text-slate-900 pr-8">{faq.question}</span>
                          <ChevronDown
                            className={`h-5 w-5 text-slate-400 transition-transform flex-shrink-0 ${
                              openFaq === index ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-300 ${
                            openFaq === index ? 'max-h-96' : 'max-h-0'
                          }`}
                        >
                          <div className="px-6 pb-4 text-slate-600">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </section>
          </AnimatedSection>

          {/* Final CTA */}
          <AnimatedSection>
            <section className="bg-gradient-to-br from-emerald-600 to-teal-600 py-20">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
                <h2 className="font-[family-name:var(--font-inter)] text-5xl sm:text-6xl font-extrabold text-white leading-tight tracking-tight">
                  Ready to find your hidden profit?
                </h2>
                <p className="text-xl sm:text-2xl text-emerald-50">
                  Free analysis. No credit card required. Results in 5 minutes.
                </p>
                <Button
                  size="lg"
                  className="bg-white text-emerald-600 hover:bg-emerald-50 text-lg px-8 py-6 transition-all hover:scale-105 hover:shadow-xl"
                  onClick={() => setShowUpload(true)}
                >
                  Analyze My Menu Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-sm text-emerald-100">
                  Join 100+ restaurant owners maximizing their profits
                </p>
              </div>
            </section>
          </AnimatedSection>
        </>
      ) : analysisResult ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <FadeIn>
            <Button
              variant="ghost"
              onClick={handleStartOver}
              className="mb-6 hover:bg-slate-100 transition-colors"
            >
              ← Analyze Different Menu
            </Button>

            <ProfitAnalyticsDashboard analysis={analysisResult} />
          </FadeIn>
        </section>
      ) : (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <FadeIn>
            <Button
              variant="ghost"
              onClick={() => setShowUpload(false)}
              className="mb-6 hover:bg-slate-100 transition-colors"
            >
              ← Back
            </Button>

            <MenuUpload onAnalysisComplete={handleAnalysisComplete} />
          </FadeIn>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-slate-900">MenuMind AI</span>
              </div>
              <p className="text-sm text-slate-600">
                Menu profit optimization for independent restaurants.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-emerald-600 transition-colors">Email Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-slate-600 text-sm">
            <p>© 2026 MenuMind AI. Built for independent restaurants.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
