/**
 * Pure helpers for comparing a candidate's answer against a question's
 * answer key. Each function returns:
 *   - isCorrect: definite-correct
 *   - isPartial: partial credit (only for matching/multi-blank)
 *   - pointsEarned: 0..1 weight (the exam page multiplies by question.points)
 *
 * Subjective types (essay, short answer) are treated as "ungraded" —
 * we return `null` so the result page can mark them as pending review
 * and award full credit. The candidate's input is preserved verbatim
 * so the grader can adjust it later.
 */

import type { Question } from '../../types/quiz';
import type { AnyAnswer, Answer } from '../../types/answer';

export interface AnswerCheckResult {
  isCorrect: boolean;
  isPartial: boolean;
  pointsEarned: number; // 0..1
  ungraded?: boolean;
}

const fullCredit: AnswerCheckResult = { isCorrect: true, isPartial: false, pointsEarned: 1 };
const zero: AnswerCheckResult = { isCorrect: false, isPartial: false, pointsEarned: 0 };

const isAnswerOfType = <T extends Answer['type']>(
  answer: AnyAnswer,
  type: T,
): answer is Extract<Answer, { type: T }> => answer !== null && answer.type === type;

export const checkAnswer = (question: Question, answer: AnyAnswer): AnswerCheckResult => {
  // Skipped = no answer recorded.
  if (answer === null) return { ...zero };

  switch (question.type) {
    case 'single_choice': {
      if (!isAnswerOfType(answer, 'single_choice')) return { ...zero };
      const correctId = question.options.find((o) => o.isCorrect)?.id;
      return answer.optionId === correctId ? fullCredit : { ...zero };
    }

    case 'multiple_choice': {
      if (!isAnswerOfType(answer, 'multiple_choice')) return { ...zero };
      const correctIds = new Set(
        question.options.filter((o) => o.isCorrect).map((o) => o.id),
      );
      const candidateIds = new Set(answer.optionIds);
      if (correctIds.size === 0 && candidateIds.size === 0) return fullCredit;
      if (correctIds.size !== candidateIds.size) return { ...zero };
      for (const id of correctIds) {
        if (!candidateIds.has(id)) return { ...zero };
      }
      return fullCredit;
    }

    case 'true_false': {
      if (!isAnswerOfType(answer, 'true_false')) return { ...zero };
      const correctOption = question.options.find((o) => o.isCorrect);
      const correctValue = correctOption?.text.toLowerCase() === 'true';
      return answer.value === correctValue ? fullCredit : { ...zero };
    }

    case 'fill_in_blank': {
      if (!isAnswerOfType(answer, 'fill_in_blank')) return { ...zero };
      const blanks = question.blanks ?? [];
      if (blanks.length === 0) return { ...zero };
      let correct = 0;
      for (const blank of blanks) {
        const expected = (blank.correctAnswer ?? '').trim();
        const got = (answer.values[blank.id] ?? '').trim();
        if (expected === '') {
          correct += 1; // no defined answer; treat as auto-credit
        } else if (question.caseSensitive) {
          if (got === expected) correct += 1;
        } else if (got.toLowerCase() === expected.toLowerCase()) {
          correct += 1;
        }
      }
      const ratio = correct / blanks.length;
      if (ratio === 1) return fullCredit;
      if (ratio === 0) return { ...zero };
      return { isCorrect: false, isPartial: true, pointsEarned: ratio };
    }

    case 'matching': {
      if (!isAnswerOfType(answer, 'matching')) return { ...zero };
      const pairs = question.matchingPairs ?? [];
      if (pairs.length === 0) return { ...zero };
      let correct = 0;
      for (const pair of pairs) {
        if (answer.pairs[pair.id] === pair.right) correct += 1;
      }
      const ratio = correct / pairs.length;
      if (ratio === 1) return fullCredit;
      if (ratio === 0) return { ...zero };
      return { isCorrect: false, isPartial: true, pointsEarned: ratio };
    }

    case 'reading_comprehension': {
      if (!isAnswerOfType(answer, 'reading_comprehension')) return { ...zero };
      const childQuestions = question.childQuestions ?? [];
      if (childQuestions.length === 0) return { ...zero };
      let earned = 0;
      let possible = 0;
      for (const child of childQuestions) {
        const childResult = checkAnswer(child, answer.childAnswers[child.id] ?? null);
        if (childResult.ungraded) continue;
        possible += 1;
        earned += childResult.pointsEarned;
      }
      if (possible === 0) {
        return { isCorrect: true, isPartial: false, pointsEarned: 1 };
      }
      const ratio = earned / possible;
      if (ratio === 1) return fullCredit;
      if (ratio === 0) return { ...zero };
      return { isCorrect: false, isPartial: true, pointsEarned: ratio };
    }

    case 'short_answer':
    case 'essay': {
      // Cannot auto-grade subjective responses.
      return { isCorrect: false, isPartial: false, pointsEarned: 0, ungraded: true };
    }

    default:
      return { ...zero };
  }
};
