/**
 * Discriminated union of per-type answer values stored against a
 * `Submission`. The exam slice keeps `answers: Record<questionId, AnyAnswer>`.
 * Per-type components dispatch `setAnswer({ questionId, value })` with the
 * variant that matches their `question.type`.
 */

import type { QuestionType } from './quiz';

export interface SingleChoiceAnswer {
  type: 'single_choice';
  optionId: string;
}

export interface MultipleChoiceAnswer {
  type: 'multiple_choice';
  optionIds: string[];
}

export interface TrueFalseAnswer {
  type: 'true_false';
  value: boolean;
}

export interface FillInBlankAnswer {
  type: 'fill_in_blank';
  values: Record<string, string>;
}

export interface MatchingAnswer {
  type: 'matching';
  pairs: Record<string, string>;
}

export interface ShortAnswerAnswer {
  type: 'short_answer';
  text: string;
}

export interface EssayAnswer {
  type: 'essay';
  text: string;
}

export interface ReadingComprehensionAnswer {
  type: 'reading_comprehension';
  childAnswers: Record<string, AnyAnswer>;
}

export type Answer =
  | SingleChoiceAnswer
  | MultipleChoiceAnswer
  | TrueFalseAnswer
  | FillInBlankAnswer
  | MatchingAnswer
  | ShortAnswerAnswer
  | EssayAnswer
  | ReadingComprehensionAnswer;

export type AnyAnswer = Answer | null;

/**
 * Empty/default answer per question type — used to initialize the
 * reducer state when a candidate first visits a question.
 */
export const emptyAnswerFor = (type: QuestionType): AnyAnswer => {
  switch (type) {
    case 'single_choice':
      return { type: 'single_choice', optionId: '' };
    case 'multiple_choice':
      return { type: 'multiple_choice', optionIds: [] };
    case 'true_false':
      return { type: 'true_false', value: false };
    case 'fill_in_blank':
      return { type: 'fill_in_blank', values: {} };
    case 'matching':
      return { type: 'matching', pairs: {} };
    case 'short_answer':
      return { type: 'short_answer', text: '' };
    case 'essay':
      return { type: 'essay', text: '' };
    case 'reading_comprehension':
      return { type: 'reading_comprehension', childAnswers: {} };
    default:
      return null;
  }
};

/** Whether the answer carries any user input (i.e. has been touched). */
export const isAnswered = (answer: AnyAnswer): boolean => {
  if (!answer) return false;
  switch (answer.type) {
    case 'single_choice':
      return answer.optionId !== '';
    case 'multiple_choice':
      return answer.optionIds.length > 0;
    case 'true_false':
      return true; // boolean always has a value
    case 'fill_in_blank':
      return Object.values(answer.values).some((v) => v.trim() !== '');
    case 'matching':
      return Object.keys(answer.pairs).length > 0;
    case 'short_answer':
      return answer.text.trim() !== '';
    case 'essay':
      return answer.text.trim() !== '';
    case 'reading_comprehension':
      return Object.keys(answer.childAnswers).length > 0;
    default:
      return false;
  }
};
