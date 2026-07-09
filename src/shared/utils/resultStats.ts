/**
 * Aggregations used by the result-page charts.
 */

import type { AnyAnswer } from '../../types';
import type { Quiz, Difficulty } from '../../types/quiz';
import type { PerQuestionResult } from './scoring';

export interface BreakdownStat {
  key: string;
  label: string;
  total: number;
  correct: number;
  accuracy: number; // 0..1
}

const groupBy = <T,>(items: T[], key: (t: T) => string): Record<string, T[]> =>
  items.reduce<Record<string, T[]>>((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});

export const topicBreakdown = (
  _quiz: Quiz,
  perQuestion: PerQuestionResult[],
): BreakdownStat[] => {
  const groups = groupBy(perQuestion, (p) => p.question.topic ?? 'Uncategorized');
  return Object.entries(groups)
    .map(([key, items]) => {
      const total = items.length;
      const correct = items.filter((i) => i.result.isCorrect).length;
      return {
        key,
        label: key,
        total,
        correct,
        accuracy: total === 0 ? 0 : correct / total,
      };
    })
    .sort((a, b) => b.total - a.total);
};

export const difficultyBreakdown = (
  _quiz: Quiz,
  perQuestion: PerQuestionResult[],
): BreakdownStat[] => {
  const labels: Record<Difficulty, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  };
  const groups = groupBy(perQuestion, (p) => p.question.difficulty);
  return (Object.keys(labels) as Difficulty[]).map((d) => {
    const items = groups[d] ?? [];
    const total = items.length;
    const correct = items.filter((i) => i.result.isCorrect).length;
    return {
      key: d,
      label: labels[d],
      total,
      correct,
      accuracy: total === 0 ? 0 : correct / total,
    };
  });
};

export interface SummaryStats {
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number; // 0..1
  averageTime: number; // seconds, 0 if not tracked
}

export const summaryStats = (
  quiz: Quiz,
  perQuestion: PerQuestionResult[],
  answers: Record<string, AnyAnswer>,
  timeSpentSeconds: number,
): SummaryStats => {
  const total = quiz.questions.length;
  const correct = perQuestion.filter((p) => p.result.isCorrect).length;
  const wrong = perQuestion.filter((p) => !p.result.isCorrect && !p.result.ungraded && answers[p.questionId] !== null && answers[p.questionId] !== undefined,).length;
  const skipped = perQuestion.filter((p) => answers[p.questionId] === null || answers[p.questionId] === undefined,).length;

  return {
    total,
    correct,
    wrong,
    skipped,
    accuracy: total === 0 ? 0 : correct / total,
    averageTime: total === 0 ? 0 : Math.round(timeSpentSeconds / total),
  };
};

/** Pseudo-rank: a deterministic function of the score for a "you placed
 * better than X% of candidates" header. Without a leaderboard we fake it
 * using a sigmoid of the percentage. */
export const estimateRankPercentile = (percentage: number): number => {
  // Higher score -> higher percentile. Tuned so 100% -> ~99th, 50% -> ~70th.
  const pct = percentage / 100;
  const estimate = 50 + 50 * Math.tanh((pct - 0.5) * 2.4);
  return Math.round(estimate);
};
