import { z } from 'zod/v4';

export const questionOptionSchema = z.object({
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
  order: z.number().optional(),
  id: z.string().optional(),
});

export const richTextSchema = z.object({
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

export const blankDefinitionSchema = z.object({
  id: z.string(),
  label: z.string(),
  correctAnswer: z.string().optional(),
});

export const matchingPairSchema = z.object({
  id: z.string(),
  left: z.string(),
  right: z.string(),
});

// Base shape without the recursive childQuestions field, so its type can be inferred
// without triggering TS circular-reference error.
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
  title: z.string().min(1, 'Question title is required'),
  content: richTextSchema.optional().default({ html: '', text: '' }),
  description: z.string().optional(),
  points: z.coerce.number().min(1, 'Points must be at least 1').default(1),
  difficulty: z.enum(['easy', 'medium', 'hard'] as const).optional().default('medium'),
  topic: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  estimatedTime: z.coerce.number().optional(),
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

export const questionSchema: z.ZodType<_QuestionData> = _baseQuestionSchema.extend({
  childQuestions: z.lazy(() => z.array(questionSchema)).optional(),
});

export const quizFormSchema = z.object({
  title: z.string().min(1, 'Quiz title is required').max(200, 'Title too long'),
  description: z.string().max(2000).optional().default(''),
  questions: z.array(questionSchema).min(1, 'At least 1 question required'),
});

export type QuizFormSchemaType = z.infer<typeof quizFormSchema>;
