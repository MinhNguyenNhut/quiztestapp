/**
 * Score a quiz attempt. Walks each question, runs `checkAnswer`, and
 * aggregates per-question results into totals + topic/difficulty stats.
 */

import type { AnyAnswer, Question, Quiz } from '../../types';
import { checkAnswer, type AnswerCheckResult } from './answerCheck';

export interface PerQuestionResult {
  questionId: string;
  question: Question;
  result: AnswerCheckResult;
  pointsEarned: number;
  pointsPossible: number;
}

export interface ScoreSummary {
  score: number;
  percentage: number;
  perQuestion: PerQuestionResult[];
  totalPoints: number;
  earnedPoints: number;
  correct: number;
  wrong: number;
  skipped: number;
  ungraded: number;
}

export const computeScore = (quiz: Quiz, answers: Record<string, AnyAnswer>): ScoreSummary => {
  const perQuestion: PerQuestionResult[] = quiz.questions.map((question) => {
    const answer = answers[question.id] ?? null;
    const result = checkAnswer(question, answer);
    const pointsPossible = question.points;
    return {
      questionId: question.id,
      question,
      result,
      pointsPossible,
      pointsEarned: result.ungraded ? 0 : result.pointsEarned * pointsPossible,
    };
  });

  const totalPoints = perQuestion.reduce((sum, p) => sum + p.pointsPossible, 0);
  const earnedPoints = perQuestion.reduce((sum, p) => sum + p.pointsEarned, 0);
  const correct = perQuestion.filter((p) => p.result.isCorrect).length;
  const wrong = perQuestion.filter(
    (p) => !p.result.isCorrect && !p.result.ungraded && answers[p.questionId] !== null && answers[p.questionId] !== undefined,
  ).length;
  const skipped = perQuestion.filter(
    (p) => answers[p.questionId] === null || answers[p.questionId] === undefined,
  ).length;
  const ungraded = perQuestion.filter((p) => p.result.ungraded).length;

  return {
    score: earnedPoints,
    percentage: totalPoints === 0 ? 0 : Math.round((earnedPoints / totalPoints) * 100),
    perQuestion,
    totalPoints,
    earnedPoints,
    correct,
    wrong,
    skipped,
    ungraded,
  };
};
