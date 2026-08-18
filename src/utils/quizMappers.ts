import { v4 as uuidv4 } from 'uuid';
import type {
  Quiz,
  QuizFormValues,
  Question,
  QuestionFormValues,
  QuestionType,
} from '../types/index.ts';

/**
 * Map persisted Quiz -> React Hook Form values.
 */
export function quizToFormValues(
  quiz: Quiz,
): QuizFormValues {
  return {
    title: quiz.title ?? '',
    description: quiz.description ?? '',

    questions: (quiz.questions ?? []).map(
      questionToFormValues,
    ),
  };
}

/**
 * Map persisted Question -> form values.
 */
function questionToFormValues(
  question: Question,
): QuestionFormValues {
  return {
    id: question.id ?? uuidv4(),

    type: question.type,

    title: question.title ?? '',

    content: question.content ?? {
      html: '',
      text: '',
    },

    description: question.description ?? '',

    points: question.points ?? 1,

    difficulty: question.difficulty ?? 'medium',

    topic: question.topic ?? '',

    tags: question.tags ?? [],

    options: (question.options ?? []).map(
      (option, optionIndex) => ({
        id: option.id ?? uuidv4(),
        text: option.text ?? '',
        isCorrect: Boolean(option.isCorrect),
        order: option.order ?? optionIndex,
      }),
    ),

    blanks: question.blanks ?? [],

    matchingPairs: question.matchingPairs ?? [],

    childQuestions: (question.childQuestions ?? []).map(
      questionToFormValues,
    ),

    estimatedTime: question.estimatedTime,
    explanation: question.explanation,
    passage: question.passage,
    expectedAnswer: question.expectedAnswer,
    caseSensitive: question.caseSensitive ?? false,
    rubric: question.rubric,
    scoringGuide: question.scoringGuide,
  };
}

/**
 * Map form values -> persisted Quiz.
 *
 * IMPORTANT:
 * Quiz itself does NOT have difficulty.
 * Difficulty belongs to each Question.
 */
export function formValuesToQuiz(
  values: QuizFormValues,
  meta: {
    id: string;
    createdAt: string;
    updatedAt: string;
  },
): Quiz {
  return {
    id: meta.id,

    title: values.title,

    description: values.description,

    createdAt: meta.createdAt,

    updatedAt: meta.updatedAt,

    questions: (values.questions ?? []).map(
      (question, index) =>
        formValuesToQuestion(
          question,
          index,
        ),
    ),
  };
}

/**
 * Map form Question -> persisted Question.
 */
function formValuesToQuestion(
  question: QuestionFormValues,
  index: number,
): Question {
  return {
    id: question.id ?? uuidv4(),
    type: question.type,
    title: question.title,
    content: question.content ?? {
      html: '',
      text: '',
    },
    description: question.description ?? '',
    points: question.points ?? 1,
    difficulty: question.difficulty ?? 'medium',
    topic: question.topic ?? '',
    tags: question.tags ?? [],
    estimatedTime: question.estimatedTime,
    order: index,
    options: (
      question.options ?? []
    ).map(
      (option, optionIndex) => ({
        text: option.text,
        isCorrect: Boolean(option.isCorrect),
        id: option.id ?? uuidv4(),
        order: option.order ?? optionIndex,
      }),
    ),
    explanation: question.explanation,
    blanks: question.blanks ?? [],
    matchingPairs: question.matchingPairs ?? [],
    passage: question.passage,
    childQuestions:
      question.childQuestions?.map(
        (child, childIndex) =>
          formValuesToQuestion(
            child,
            childIndex,
          ),
      ) ?? [],
    expectedAnswer: question.expectedAnswer,
    caseSensitive: question.caseSensitive,
    rubric: question.rubric,
    scoringGuide: question.scoringGuide,
  };
}

/**
 * Build a default QuestionFormValues.
 */
export function createQuestionTemplate(
  type: QuestionType,
): QuestionFormValues {
  const base: QuestionFormValues = {
    type,
    title: '',
    content: {
      html: '',
      text: '',
    },
    description: '',
    points: 1,
    difficulty: 'medium',
    topic: '',
    tags: [],
    options: defaultOptionsFor(type),
  };

  switch (type) {
    case 'fill_in_blank':
      return {
        ...base,
        blanks: [],
      };

    case 'matching':
      return {
        ...base,
        matchingPairs: [],
      };

    case 'reading_comprehension':
      return {
        ...base,
        passage: {
          html: '',
          text: '',
        },
        childQuestions: [],
      };

    case 'short_answer':
      return {
        ...base,
        expectedAnswer: '',
        caseSensitive: false,
      };

    case 'essay':
      return {
        ...base,
        rubric: {
          html: '',
          text: '',
        },
        scoringGuide: '',
      };

    default:
      return base;
  }
}

function defaultOptionsFor(
  type: QuestionType,
): QuestionFormValues['options'] {
  switch (type) {
    case 'single_choice':
      return [
        {
          text: '',
          isCorrect: true,
        },
        {
          text: '',
          isCorrect: false,
        },
      ];

    case 'multiple_choice':
      return [
        {
          text: '',
          isCorrect: false,
        },
        {
          text: '',
          isCorrect: false,
        },
      ];

    case 'true_false':
      return [
        {
          text: 'True',
          isCorrect: true,
        },
        {
          text: 'False',
          isCorrect: false,
        },
      ];

    case 'fill_in_blank':
    case 'short_answer':
    case 'essay':
      return [
        {
          text: '',
          isCorrect: false,
        },
      ];

    case 'matching':
    case 'reading_comprehension':
      return [
        {
          text: '',
          isCorrect: false,
        },
        {
          text: '',
          isCorrect: false,
        },
      ];

    default:
      return [
        {
          text: '',
          isCorrect: true,
        },
        {
          text: '',
          isCorrect: false,
        },
      ];
  }
}
