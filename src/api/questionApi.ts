import type {
  Question,
  QuestionType,
  Difficulty,
  QuestionFormValues,
} from '../types/quiz';
import { apiDelete, apiGet, apiPatch, apiPost } from './httpClient';

export type CreateQuestionOptionPayload = {
  text: string;
  isCorrect: boolean;
  order: number;
};

export type CreateQuestionPayload = {
  type: QuestionType;
  title: string;
  content: Question['content'];
  description?: string;
  points: number;
  difficulty: Difficulty;
  topic?: string;
  tags?: string[];
  order: number;
  options?: CreateQuestionOptionPayload[];
  explanation?: Question['explanation'];
  blanks?: Question['blanks'];
  matchingPairs?: Question['matchingPairs'];
  passage?: Question['passage'];
  childQuestions?: QuestionFormValues[];
  expectedAnswer?: string;
  caseSensitive?: boolean;
  rubric?: Question['rubric'];
  scoringGuide?: string;
};

export type UpdateQuestionPayload = Partial<Omit<CreateQuestionPayload, 'content'>>;

export const questionApi = {
  listForQuiz: (quizId: string) =>
    apiGet<Question[]>(
      `/api/quizzes/${quizId}/questions`,
    ),

  getById: (id: string) =>
    apiGet<Question>(
      `/api/questions/${id}`,
    ),

  create: (
    quizId: string,
    payload: CreateQuestionPayload,
  ) =>
    apiPost<Question>(
      `/api/quizzes/${quizId}/questions`,
      payload,
    ),

  update: (
    id: string,
    payload: UpdateQuestionPayload,
  ) =>
    apiPatch<Question>(
      `/api/questions/${id}`,
      payload,
    ),

  remove: (id: string) =>
    apiDelete<void>(
      `/api/questions/${id}`,
    ),

  reorder: (
    quizId: string,
    questionIds: string[],
  ) =>
    apiPatch<Question[]>(
      `/api/quizzes/${quizId}/questions/reorder`,
      { questionIds },
    ),
};
