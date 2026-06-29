import type { Quiz, Difficulty } from '../types/index.ts';

/**
 * Display helpers used by `QuizListPage` and the future Dashboard stats row.
 *
 * Pure functions — no React, no Redux. Reusable across cards, headers,
 * and any future "Recent activity" panel.
 */

/**
 * Compute the most common difficulty across a quiz's questions.
 * Returns null when the quiz has no questions.
 *
 * Ties resolve to whichever difficulty appears first in the iteration order
 * (`easy` < `medium` < `hard`), giving stable, predictable chip colors.
 */
export function aggregateDifficulty(quiz: Quiz): Difficulty | null {
  if (quiz.questions.length === 0) return null;
  const counts: Record<Difficulty, number> = { easy: 0, medium: 0, hard: 0 };
  for (const q of quiz.questions) counts[q.difficulty] += 1;
  const entries = (Object.entries(counts) as [Difficulty, number][])
    .sort((a, b) => b[1] - a[1]);
  return entries[0][1] > 0 ? entries[0][0] : null;
}

/**
 * Sum of per-question estimated times in minutes.
 * Falls back to one minute per question when no `estimatedTime` is set.
 */
export function totalEstimatedMinutes(quiz: Quiz): number {
  const explicit = quiz.questions.reduce(
    (sum, q) => sum + (typeof q.estimatedTime === 'number' ? q.estimatedTime : 0),
    0
  );
  return explicit > 0 ? explicit : quiz.questions.length;
}

/**
 * Format an ISO timestamp as a coarse relative-time string.
 * Coarser than Intl.RelativeTimeFormat on purpose: it reads naturally
 * inside card chips and avoids locale divergence between browser engines.
 */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  if (diffMs < 60_000) return 'just now';
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString();
}