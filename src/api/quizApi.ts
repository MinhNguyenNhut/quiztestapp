/**
 * Quiz-API client.
 *
 * Mirrors the QuizController endpoints under `/api/quizzes`. The
 * `listQuizzes` call returns the paginated `{ data, total }` shape the
 * backend uses (see QuizController.findAll). Other endpoints return the
 * quiz document directly; `getQuizById` includes a nested `questions[]`
 * because QuizController.findOne eagerly loads them — callers that want
 * just metadata can ignore that field.
 */
import type { CandidateFieldsConfig } from '../types/candidate';
import type { Quiz } from '../types/quiz';
import { apiDelete, apiGet, apiPatch, apiPost } from './httpClient';

export interface PaginatedQuizzes {
  data: Quiz[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateQuizPayload {
  title: string;
  description: string;
  /** Optional owner-defined candidate-info field config. */
  candidateFieldsConfig?: CandidateFieldsConfig;
}

export type UpdateQuizPayload = Partial<CreateQuizPayload>;

export const quizApi = {
  list: (page = 1, limit = 20) =>
    apiGet<PaginatedQuizzes>('/api/quizzes', { params: { page, limit } }),

  getById: (id: string) => apiGet<Quiz>(`/api/quizzes/${id}`),

  create: (payload: CreateQuizPayload) =>
    apiPost<Quiz>('/api/quizzes', payload),

  update: (id: string, payload: UpdateQuizPayload) =>
    apiPatch<Quiz>(`/api/quizzes/${id}`, payload),

  remove: (id: string) => apiDelete<void>(`/api/quizzes/${id}`),

  /** PATCH /api/quizzes/:id/candidate-fields — `config` body is any. */
  patchCandidateFields: (id: string, config: CandidateFieldsConfig) =>
    apiPatch<Quiz>(`/api/quizzes/${id}/candidate-fields`, { candidateFieldsConfig: config }),
};
