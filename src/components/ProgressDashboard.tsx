'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudyStore } from '@/store/studyStore';
import { Flame, Trophy, Clock, Target, Brain, TrendingUp } from 'lucide-react';

export function ProgressDashboard() {
  const { getProgressStats } = useStudyStore();
  const progress = getProgressStats();

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const stats = [
    {
      icon: Flame,
      label: 'Current Streak',
      value: `${progress.currentStreak} ${progress.currentStreak === 1 ? 'day' : 'days'}`,
      description: `Best: ${progress.longestStreak} days`,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
    },
    {
      icon: Trophy,
      label: 'Mastered',
      value: progress.masteredCards.toString(),
      description: 'cards mastered',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      icon: Brain,
      label: 'Learning',
      value: progress.learningCards.toString(),
      description: 'cards in progress',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Target,
      label: 'Accuracy',
      value: `${progress.accuracy}%`,
      description: 'correct answers',
      color: 'text-green-500',
      bgColor: 'bg-green-50',
    },
    {
      icon: Clock,
      label: 'Study Time Today',
      value: formatTime(progress.studyTimeToday),
      description: `Total: ${formatTime(progress.totalStudyTimeMs)}`,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
    },
    {
      icon: TrendingUp,
      label: 'Cards Reviewed',
      value: progress.cardsReviewedToday.toString(),
      description: `Total: ${progress.totalCardsReviewed}`,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Your Progress
        </CardTitle>
        <CardDescription>
          Track your learning journey and study habits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold truncate">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Study Calendar Heatmap (Simple version) */}
        {progress.studyDates.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">Study Activity</h3>
            <div className="flex flex-wrap gap-1">
              {progress.studyDates.slice(-30).map((date, index) => {
                const dayOfWeek = new Date(date).getDay();
                return (
                  <div
                    key={index}
                    className="w-3 h-3 rounded-sm bg-green-500 hover:bg-green-600 transition-colors"
                    title={date}
                  />
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {progress.studyDates.length} {progress.studyDates.length === 1 ? 'day' : 'days'} studied
            </p>
          </div>
        )}

        {/* New cards waiting */}
        {progress.newCards > 0 && (
          <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-medium text-blue-900">
              📚 {progress.newCards} new {progress.newCards === 1 ? 'card' : 'cards'} waiting to be studied!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
