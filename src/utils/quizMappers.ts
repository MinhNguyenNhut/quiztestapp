import { v4 as uuidv4 } from 'uuid';
import type {
  Quiz,
  QuizFormValues,
  Question,
  QuestionFormValues,
  QuestionType,
  Difficulty,
} from '../types/index.ts';

/**
 * Mapping utilities between the persisted `Quiz` shape and the looser
 * `QuizFormValues` shape used by React Hook Form.
 *
 * These functions are pure: they take all inputs explicitly and return
 * new objects. Both directions preserve `id`s and `order`s so that
 * `useFieldArray` keys and option references survive a round-trip.
 */

/**
 * Map a persisted `Quiz` to form values for use as RHF `defaultValues`.
 *
 * - `id`s are preserved.
 * - `order` is dropped (it is derived from array index on the way back).
 * - `createdAt` / `updatedAt` are dropped (only the page knows these).
 */
export function quizToFormValues(quiz: Quiz): QuizFormValues {
  return {
    title: quiz.title,
    description: quiz.description,
    questions: quiz.questions.map(questionToFormValues),
  };
}

function questionToFormValues(question: Question): QuestionFormValues {
  const { order: _order, ...rest } = question;
  return {
    ...rest,
    options: question.options.map(({ order, ...option }) => option),
    childQuestions: question.childQuestions?.map(questionToFormValues),
  };
}

/**
 * Map validated form values back to a persisted `Quiz`.
 *
 * - `id`, `createdAt`, `updatedAt` must be supplied by the caller.
 * - `order` is reassigned from the array index (top-level and recursively
 *   for `childQuestions`).
 * - Missing option IDs are filled with `uuidv4()`; `order` defaults to index.
 * - `difficulty` is computed from the question difficulties (hard if any hard, else medium if any medium, else easy).
 */
export function formValuesToQuiz(
  values: QuizFormValues,
  meta: { id: string; createdAt: string; updatedAt: string }
): Quiz {
  const difficulties = values.questions.map((q) => q.difficulty);
  const difficulty = difficulties.includes('hard') ? 'hard' : difficulties.includes('medium') ? 'medium' : 'easy';

  return {
    id: meta.id,
    title: values.title,
    description: values.description,
    createdAt: meta.createdAt,
    updatedAt: meta.updatedAt,
    difficulty,
    questions: values.questions.map((question, index) =>
      formValuesToQuestion(question, index)
    ),
  };
}

function formValuesToQuestion(
  question: QuestionFormValues,
  index: number
): Question {
  return {
    ...question,
    id: question.id ?? uuidv4(),
    order: index,
    options: question.options.map((option, optionIndex) => ({
      text: option.text,
      isCorrect: option.isCorrect,
      id: option.id ?? uuidv4(),
      order: option.order ?? optionIndex,
    })),
    childQuestions: question.childQuestions?.map((child, childIndex) =>
      formValuesToQuestion(child, childIndex)
    ),
  };
}

/**
 * Build a schema-valid `QuestionFormValues` template for the given type,
 * including per-type defaults for `options`, `blanks`, `matchingPairs`,
 * `passage`, `childQuestions`, `expectedAnswer`, etc.
 *
 * Pure: each call returns a fresh object with new IDs.
 */
export function createQuestionTemplate(type: QuestionType): QuestionFormValues {
  const base: QuestionFormValues = {
    id: uuidv4(),
    type,
    title: '',
    content: { html: '', text: '' },
    description: '',
    points: 1,
    difficulty: 'medium' as Difficulty,
    topic: '',
    tags: [],
    options: defaultOptionsFor(type),
  };

  switch (type) {
    case 'fill_in_blank':
      return { ...base, blanks: [] };
    case 'matching':
      return { ...base, matchingPairs: [] };
    case 'reading_comprehension':
      return {
        ...base,
        passage: { html: '', text: '' },
        childQuestions: [],
      };
    case 'short_answer':
      return { ...base, expectedAnswer: '', caseSensitive: false };
    case 'essay':
      return { ...base, rubric: { html: '', text: '' }, scoringGuide: '' };
    default:
      return base;
  }
}

function defaultOptionsFor(
  type: QuestionType
): QuestionFormValues['options'] {
  switch (type) {
    case 'single_choice':
      return [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
      ];
    case 'multiple_choice':
      return [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ];
    case 'true_false':
      return [
        { text: 'True', isCorrect: true },
        { text: 'False', isCorrect: false },
      ];
    case 'fill_in_blank':
    case 'short_answer':
    case 'essay':
      return [{ text: '', isCorrect: false }];
    case 'matching':
    case 'reading_comprehension':
      return [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ];
    default:
      return [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
      ];
  }
}
