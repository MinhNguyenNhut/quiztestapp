import type { Difficulty, QuestionFormValues, QuestionType, QuizFormValues } from '../types/quiz';
import { apiPost, HttpError } from './httpClient';

export type AiQuizDifficulty = Difficulty | 'mixed';
export type AiQuizLanguage = 'vi' | 'en';

export interface GenerateAiQuizRequest {
  prompt: string;
  questionCount: number;
  difficulty: AiQuizDifficulty;
  language: AiQuizLanguage;
  questionTypes: QuestionType[];
  sourceMaterial?: string;
}

export interface AiQuizGenerationResult extends Omit<QuizFormValues, 'questions'> {
  questions: QuestionFormValues[];
}

export interface AiQuizRequestError {
  status: number | null;
  message: string;
}

export const aiQuizApi = {
  generate: (request: GenerateAiQuizRequest) =>
    apiPost<AiQuizGenerationResult>('/ai/quiz/generate', request),
};

export function toAiQuizRequestError(error: unknown): AiQuizRequestError {
  if (error instanceof HttpError) {
    return { status: error.status, message: error.message };
  }
  return {
    status: null,
    message: error instanceof Error ? error.message : 'AI quiz generation failed.',
  };
}
