// Client-side usage tracking for free tier users
export interface UsageStats {
  count: number;
  lastReset: number;
}

const DAILY_FREE_LIMIT = 5;
const STORAGE_KEY = 'prompt_usage';

export function getUsageStats(): UsageStats {
  if (typeof window === 'undefined') {
    return { count: 0, lastReset: Date.now() };
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { count: 0, lastReset: Date.now() };
  }

  try {
    const stats: UsageStats = JSON.parse(stored);

    // Reset if it's been more than 24 hours
    const now = Date.now();
    const hoursSinceReset = (now - stats.lastReset) / (1000 * 60 * 60);

    if (hoursSinceReset >= 24) {
      return { count: 0, lastReset: now };
    }

    return stats;
  } catch {
    return { count: 0, lastReset: Date.now() };
  }
}

export function incrementUsage(): void {
  const stats = getUsageStats();
  stats.count += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function getRemainingFreePrompts(): number {
  const stats = getUsageStats();
  return Math.max(0, DAILY_FREE_LIMIT - stats.count);
}

export function hasFreeTierAccess(): boolean {
  return getRemainingFreePrompts() > 0;
}

export function getTimeUntilReset(): string {
  const stats = getUsageStats();
  const resetTime = stats.lastReset + (24 * 60 * 60 * 1000);
  const msUntilReset = resetTime - Date.now();

  if (msUntilReset <= 0) return 'Soon';

  const hours = Math.floor(msUntilReset / (1000 * 60 * 60));
  const minutes = Math.floor((msUntilReset % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
