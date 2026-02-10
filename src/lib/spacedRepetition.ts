import { Flashcard } from '@/types/studyset';

/**
 * SM-2 Spaced Repetition Algorithm
 * Based on SuperMemo 2 algorithm by Piotr Wozniak
 *
 * Quality ratings:
 * 5 - Perfect response
 * 4 - Correct response after hesitation
 * 3 - Correct response with serious difficulty
 * 2 - Incorrect response; correct answer easy to recall
 * 1 - Incorrect response; correct answer remembered
 * 0 - Complete blackout
 */

export interface ReviewResult {
  quality: 0 | 1 | 2 | 3 | 4 | 5; // User's performance rating
}

/**
 * Calculate next review date using SM-2 algorithm
 * @param card - Current flashcard with SRS data
 * @param quality - Performance quality (0-5)
 * @returns Updated flashcard with new SRS values
 */
export function calculateNextReview(card: Flashcard, quality: ReviewResult['quality']): Flashcard {
  const now = Date.now();

  let { easeFactor, interval, repetitions } = card;

  // Update ease factor (difficulty)
  // Higher quality = easier card = longer intervals
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

  // If quality < 3, restart the card (failed)
  if (quality < 3) {
    repetitions = 0;
    interval = 1; // Review tomorrow
  } else {
    // Successful review
    repetitions += 1;

    // Calculate new interval
    if (repetitions === 1) {
      interval = 1; // Review in 1 day
    } else if (repetitions === 2) {
      interval = 6; // Review in 6 days
    } else {
      interval = Math.round(interval * easeFactor);
    }
  }

  // Calculate next review date
  const nextReviewDate = now + interval * 24 * 60 * 60 * 1000; // Convert days to milliseconds

  // Update stats
  const totalReviews = card.totalReviews + 1;
  const correctCount = quality >= 3 ? card.correctCount + 1 : card.correctCount;
  const incorrectCount = quality < 3 ? card.incorrectCount + 1 : card.incorrectCount;

  // Leech detection - track consecutive failures
  const consecutiveFails = quality < 3 ? (card.consecutiveFails || 0) + 1 : 0;
  const isLeech = consecutiveFails >= 4; // Mark as leech after 4 consecutive failures

  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    nextReviewDate,
    lastReviewed: now,
    totalReviews,
    correctCount,
    incorrectCount,
    consecutiveFails,
    isLeech,
  };
}

/**
 * Get cards that are due for review today
 * @param cards - Array of flashcards
 * @returns Cards that should be reviewed today
 */
export function getDueCards(cards: Flashcard[]): Flashcard[] {
  const now = Date.now();
  return cards
    .filter(card => card.nextReviewDate <= now)
    .sort((a, b) => a.nextReviewDate - b.nextReviewDate); // Oldest first
}

/**
 * Get cards by their learning status
 */
export function categorizeCards(cards: Flashcard[]): {
  new: Flashcard[];
  learning: Flashcard[];
  review: Flashcard[];
  mastered: Flashcard[];
} {
  return {
    new: cards.filter(c => c.totalReviews === 0),
    learning: cards.filter(c => c.totalReviews > 0 && c.interval < 7),
    review: cards.filter(c => c.interval >= 7 && c.interval < 21),
    mastered: cards.filter(c => c.interval >= 21 && c.easeFactor >= 2.5),
  };
}

/**
 * Initialize a new flashcard with default SRS values
 */
export function initializeCard(card: Partial<Flashcard> & { id: string; front: string; back: string }): Flashcard {
  return {
    type: 'normal',
    easeFactor: 2.5, // Default difficulty
    interval: 0, // New card
    repetitions: 0,
    nextReviewDate: Date.now(), // Available immediately
    lastReviewed: null,
    totalReviews: 0,
    correctCount: 0,
    incorrectCount: 0,
    consecutiveFails: 0,
    isLeech: false,
    ...card,
  };
}

/**
 * Calculate study statistics for a set of cards
 */
export function calculateCardStats(cards: Flashcard[]): {
  new: number;
  learning: number;
  review: number;
  mastered: number;
  dueToday: number;
  accuracy: number;
} {
  const categorized = categorizeCards(cards);
  const due = getDueCards(cards);

  const totalReviews = cards.reduce((sum, c) => sum + c.totalReviews, 0);
  const totalCorrect = cards.reduce((sum, c) => sum + c.correctCount, 0);
  const accuracy = totalReviews > 0 ? Math.round((totalCorrect / totalReviews) * 100) : 0;

  return {
    new: categorized.new.length,
    learning: categorized.learning.length,
    review: categorized.review.length,
    mastered: categorized.mastered.length,
    dueToday: due.length,
    accuracy,
  };
}
