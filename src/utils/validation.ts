import { z } from 'zod/v4';
import type { TFunction } from 'i18next';

export const createQuestionSchemas = (t: TFunction) => {
  const questionOptionSchema = z.object({
    text: z.string().min(1, t('validation.optionTextRequired')),
    isCorrect: z.boolean(),
    order: z.number().optional(),
    id: z.string().optional(),
  });

  const richTextSchema = z.object({
    html: z.string(),
    text: z.string(),
    blanks: z
      .array(
        z.object({
          id: z.string(),
          label: z.string(),
          correctAnswer: z.string().optional(),
        }),
      )
      .optional(),
  });

  const blankDefinitionSchema = z.object({
    id: z.string(),
    label: z.string(),
    correctAnswer: z.string().optional(),
  });

  const matchingPairSchema = z.object({
    id: z.string(),
    left: z.string(),
    right: z.string(),
  });

  const _baseQuestionFields = {
    id: z.string().optional(),

    type: z.enum([
      'single_choice',
      'multiple_choice',
      'true_false',
      'fill_in_blank',
      'matching',
      'reading_comprehension',
      'short_answer',
      'essay',
    ] as const),

    title: z.string().min(1, t('validation.questionTitleRequired')),

    content: richTextSchema.optional().default({ html: '', text: '' }),

    description: z.string().optional(),

    points: z.coerce.number().min(1, t('validation.pointsMinimum')).default(1),

    difficulty: z.enum(['easy', 'medium', 'hard'] as const).optional().default('medium'),

    topic: z.string().optional(),

    tags: z.array(z.string()).optional().default([]),

    options: z.array(questionOptionSchema).optional().default([]),

    explanation: richTextSchema.optional().default({ html: '', text: '' }),

    blanks: z.array(blankDefinitionSchema).optional(),

    matchingPairs: z.array(matchingPairSchema).optional(),

    passage: richTextSchema.optional(),

    expectedAnswer: z.string().optional(),

    caseSensitive: z.boolean().optional(),

    rubric: richTextSchema.optional(),

    scoringGuide: z.string().optional(),
  } satisfies z.ZodRawShape;

  const _baseQuestionSchema = z.object(_baseQuestionFields);

  type _BaseQuestion = z.infer<typeof _baseQuestionSchema>;

  interface _QuestionData extends _BaseQuestion {
    childQuestions?: _QuestionData[];
  }

  const questionSchema: z.ZodType<_QuestionData> =
    _baseQuestionSchema.extend({
      childQuestions: z
        .lazy(() => z.array(questionSchema))
        .optional(),
    });

  const createQuizFormSchema = z.object({
    title: z.string().min(1, t('validation.quizTitleRequired')).max(200, t('validation.quizTitleTooLong')),
    description: z.string().max(2000, t('validation.quizDescriptionTooLong')).optional().default(''),
    estimatedTime: z.number().min(0).optional().default(0),
    questions: z.array(questionSchema).min(1, t('validation.atLeastOneQuestion')),
  });

  return {
    questionOptionSchema,
    richTextSchema,
    blankDefinitionSchema,
    matchingPairSchema,
    questionSchema,
    createQuizFormSchema,
  };
};

export type QuestionSchemas =
  ReturnType<typeof createQuestionSchemas>;
