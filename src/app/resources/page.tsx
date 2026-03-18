'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  ArrowLeft,
  BookOpen,
  FileText,
  MessageSquare,
  TrendingUp,
  Users,
  Calculator,
  ChefHat,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import { FadeIn, AnimatedSection } from '@/components/AnimatedSection';

export default function ResourcesPage() {
  const resourceCategories = [
    {
      title: "Industry Reports & Studies",
      icon: FileText,
      color: "emerald",
      resources: [
        {
          title: "National Restaurant Association: State of the Industry",
          description: "Annual report covering profit margins, labor costs, and operational challenges facing restaurants.",
          url: "https://restaurant.org/research-and-media/research/",
          type: "Report"
        },
        {
          title: "Toast: Restaurant Success in 2025",
          description: "Data-driven insights on what separates successful restaurants from struggling ones. Focus on menu engineering and pricing.",
          url: "https://pos.toasttab.com/blog",
          type: "Study"
        },
        {
          title: "Restaurant Labor Cost Guide",
          description: "How labor costs impact profit margins and strategies to optimize scheduling without sacrificing service.",
          url: "https://7shifts.com/blog",
          type: "Guide"
        },
        {
          title: "Harvard Business Review: Restaurant Pricing",
          description: "Academic research on menu psychology, pricing strategies, and profit optimization techniques.",
          url: "https://hbr.org/topic/subject/pricing",
          type: "Research"
        }
      ]
    },
    {
      title: "Restaurant Forums & Communities",
      icon: MessageSquare,
      color: "blue",
      resources: [
        {
          title: "Reddit: r/restaurantowners",
          description: "Active community of 50k+ restaurant owners sharing profit strategies, cost-cutting tips, and menu pricing discussions.",
          url: "https://reddit.com/r/restaurantowners",
          type: "Forum"
        },
        {
          title: "ChefTalk Professional Community",
          description: "Professional chef community discussing menu costing, ingredient pricing, and profitability.",
          url: "https://cheftalk.com",
          type: "Community"
        },
        {
          title: "WebstaurantStore Restaurant Resources",
          description: "Comprehensive guides for restaurant operators focused on financial management and profit optimization.",
          url: "https://webstaurantstore.com/blog",
          type: "Resource"
        }
      ]
    },
    {
      title: "Menu Engineering & Pricing",
      icon: Calculator,
      color: "purple",
      resources: [
        {
          title: "Menu Engineering Complete Guide",
          description: "Free comprehensive guide to menu engineering - profit matrix, star analysis, and pricing psychology.",
          url: "https://restaurantengine.com",
          type: "Guide"
        },
        {
          title: "Food Cost Percentage Calculator",
          description: "Free tool to calculate ideal menu prices based on your target food cost percentage (28-35% industry standard).",
          url: "https://calculator.academy/food-cost-percentage-calculator/",
          type: "Tool"
        },
        {
          title: "Restaurant Profit Margins Guide",
          description: "In-depth guide on how professional restaurateurs optimize their menus for maximum profit.",
          url: "https://squareup.com/us/en/townsquare/restaurant-profit-margins",
          type: "Article"
        }
      ]
    },
    {
      title: "AI & Technology for Restaurants",
      icon: TrendingUp,
      color: "orange",
      resources: [
        {
          title: "Modern Restaurant Management",
          description: "How AI is transforming restaurant operations - from dynamic pricing to inventory optimization.",
          url: "https://modernrestaurantmanagement.com",
          type: "Article"
        },
        {
          title: "Nation's Restaurant News: Tech Trends",
          description: "Latest technology trends including AI menu optimization, predictive analytics, and profit automation.",
          url: "https://nrn.com",
          type: "News"
        },
        {
          title: "QSR Magazine: Restaurant Technology",
          description: "Coverage of emerging restaurant tech, including AI-powered profit optimization tools.",
          url: "https://qsrmagazine.com",
          type: "Magazine"
        }
      ]
    }
  ];

  const painPoints = [
    {
      problem: "Rising Food Costs",
      stat: "23% increase in 2023-2025",
      solution: "AI-powered menu pricing adjusts automatically as ingredient costs change, protecting margins.",
      icon: TrendingUp
    },
    {
      problem: "Thin Profit Margins",
      stat: "Average 3-5% net profit",
      solution: "Menu engineering identifies high-margin items to promote and low-margin items to adjust or remove.",
      icon: DollarSign
    },
    {
      problem: "Labor Shortages",
      stat: "78% report staffing issues",
      solution: "Automated profit analysis eliminates hours of manual spreadsheet work, freeing staff for customer service.",
      icon: Users
    },
    {
      problem: "Menu Complexity",
      stat: "Average 40-100 items",
      solution: "AI analyzes entire menu in seconds, showing exactly which dishes drive profit and which don't.",
      icon: ChefHat
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">MenuMind AI</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <FadeIn>
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
              <BookOpen className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-900">
                Free Resources for Restaurant Owners
              </span>
            </div>
            <h1 className="font-[family-name:var(--font-inter)] text-5xl sm:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
              The Complete Guide to Restaurant Profitability
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Industry reports, expert forums, and AI tools to help you maximize profits and reduce costs.
            </p>
          </div>
        </FadeIn>
      </section>

      {/* Pain Points */}
      <AnimatedSection>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-inter)] text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Why Restaurants Need AI for Profit Optimization
            </h2>
            <p className="text-lg text-slate-600">
              The challenges facing independent restaurants in 2026
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {painPoints.map((point, index) => (
              <FadeIn key={index} delay={index * 100}>
                <Card className="border-2 hover:border-emerald-200 transition-all h-full">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-3">
                      <point.icon className="h-6 w-6 text-red-600" />
                    </div>
                    <CardTitle className="text-lg">{point.problem}</CardTitle>
                    <CardDescription className="text-red-600 font-semibold">
                      {point.stat}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600">{point.solution}</p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </section>
      </AnimatedSection>

      {/* Resources */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-16">
          {resourceCategories.map((category, categoryIndex) => (
            <AnimatedSection key={categoryIndex}>
              <div>
                <div className="flex items-center gap-3 mb-8">
                  <div className={`h-12 w-12 rounded-lg bg-${category.color}-100 flex items-center justify-center`}>
                    <category.icon className={`h-6 w-6 text-${category.color}-600`} />
                  </div>
                  <h2 className="font-[family-name:var(--font-inter)] text-3xl font-bold text-slate-900 tracking-tight">
                    {category.title}
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {category.resources.map((resource, resourceIndex) => (
                    <FadeIn key={resourceIndex} delay={resourceIndex * 50}>
                      <Card className="border-2 hover:border-emerald-200 transition-all h-full group">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
                                {resource.title}
                              </CardTitle>
                              <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-slate-100 text-slate-600 rounded">
                                {resource.type}
                              </span>
                            </div>
                            <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 transition-colors flex-shrink-0" />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-slate-600 mb-4">{resource.description}</p>
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                          >
                            Visit Resource →
                          </a>
                        </CardContent>
                      </Card>
                    </FadeIn>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* CTA */}
      <AnimatedSection>
        <section className="bg-gradient-to-br from-emerald-600 to-teal-600 py-20 mt-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <h2 className="font-[family-name:var(--font-inter)] text-4xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Ready to optimize your menu profits?
            </h2>
            <p className="text-xl text-emerald-50">
              Join restaurant owners using AI to find hidden profit in their menus
            </p>
            <Link href="/">
              <Button
                size="lg"
                className="bg-white text-emerald-600 hover:bg-emerald-50 text-lg px-8 py-6 transition-all hover:scale-105 hover:shadow-xl"
              >
                Try MenuMind AI Free
                <ArrowLeft className="ml-2 h-5 w-5 rotate-180" />
              </Button>
            </Link>
          </div>
        </section>
      </AnimatedSection>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-slate-600 text-sm">
            <p>© 2026 MenuMind AI. Resources for independent restaurants.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
