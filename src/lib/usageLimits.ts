import { UsageStats } from '@/types/studyset';

export const FREE_TIER_DAILY_LIMIT = 3;

export interface DailyLimitCheck {
  canGenerate: boolean;
  remaining: number;
  resetsAt: string;
}

/**
 * Check if user can generate flashcards today (client-side check)
 */
export function checkDailyLimit(usageStats: UsageStats): DailyLimitCheck {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  // Reset counter if new day
  if (usageStats.lastResetDate !== today) {
    return {
      canGenerate: true,
      remaining: FREE_TIER_DAILY_LIMIT,
      resetsAt: getNextMidnight(),
    };
  }

  const remaining = FREE_TIER_DAILY_LIMIT - usageStats.generationsToday;

  return {
    canGenerate: remaining > 0,
    remaining: Math.max(0, remaining),
    resetsAt: getNextMidnight(),
  };
}

/**
 * Get next midnight timestamp for countdown
 */
export function getNextMidnight(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.toISOString();
}

/**
 * Get user-friendly time until reset
 */
export function getTimeUntilReset(): string {
  const now = new Date();
  const midnight = new Date();
  midnight.setDate(midnight.getDate() + 1);
  midnight.setHours(0, 0, 0, 0);

  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
