import type { TFunction } from 'i18next';
import type { Question, Difficulty } from '../types/index.ts';

/**
 * Display helpers used by QuizListPage and future Dashboard stats.
 *
 * Pure functions — no React, no Redux.
 */

/**
 * Compute the most common difficulty across questions.
 *
 * Returns null when there are no questions.
 *
 * Ties resolve in this order:
 * easy -> medium -> hard
 */
export function aggregateDifficulty(
  questions: Question[] = [],
): Difficulty | null {
  if (questions.length === 0) {
    return null;
  }

  const counts: Record<Difficulty, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
  };

  for (const question of questions) {
    counts[question.difficulty] += 1;
  }

  const entries = (
    Object.entries(counts) as [Difficulty, number][]
  ).sort((a, b) => b[1] - a[1]);

  return entries[0][1] > 0
    ? entries[0][0]
    : null;
}

/**
 * Format an ISO timestamp as a coarse relative-time string.
 */
export function formatRelativeTime(
  iso: string,
  t: TFunction,
  now: Date = new Date(),
): string {
  const diffMs =
    now.getTime() -
    new Date(iso).getTime();

  if (diffMs < 60_000) {
    return t('time.justNow');
  }

  const mins = Math.floor(
    diffMs / 60_000,
  );

  if (mins < 60) {
    return t('time.minutesAgo', {
      count: mins,
    });
  }

  const hours = Math.floor(
    mins / 60,
  );

  if (hours < 24) {
    return t('time.hoursAgo', {
      count: hours,
    });
  }

  const days = Math.floor(
    hours / 24,
  );

  if (days < 7) {
    return t('time.daysAgo', {
      count: days,
    });
  }

  return new Date(iso).toLocaleDateString(
    t('common.locale'),
  );
}
