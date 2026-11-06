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
import type { Quiz, QuizSettings } from '../types/quiz';
import { apiDelete, apiGet, apiPatch, apiPost } from './httpClient';

export interface PaginatedQuizzes {
  data: Quiz[];
  total: number;
  page: number;
  limit: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readPageNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : fallback;
}

function normalizePaginatedQuizzes(
  value: unknown,
  fallbackPage: number,
  fallbackLimit: number,
): PaginatedQuizzes {
  if (!isRecord(value) || !Array.isArray(value.data)) {
    throw new Error('The quizzes endpoint returned an invalid paginated response.');
  }

  const metadata = isRecord(value.meta) ? value.meta : {};
  const total = readPageNumber(value.total ?? metadata.total, Number.NaN);
  if (!Number.isInteger(total)) {
    throw new Error('The quizzes endpoint did not return a valid total count.');
  }

  return {
    data: value.data as Quiz[],
    total,
    page: readPageNumber(value.page ?? metadata.page, fallbackPage),
    limit: readPageNumber(value.limit ?? metadata.limit, fallbackLimit),
  };
}

export interface PublicQuizListParams {
  search?: string;
  page?: number;
  limit?: number;
  [key: string]: string | number | undefined;
}

export interface CreateQuizPayload {
  title: string;
  description: string;
  /** Optional owner-defined candidate-info field config. */
  candidateFieldsConfig?: CandidateFieldsConfig;
  /** Optional quiz behavior and grading settings. */
  settings?: QuizSettings;
  /** ID of the user creating the quiz. */
  createdBy?: string;
}

export type UpdateQuizPayload = Partial<CreateQuizPayload>;

export const quizApi = {
  list: async (page = 1, limit = 20) =>
    normalizePaginatedQuizzes(
      await apiGet<unknown>('/api/quizzes', { params: { page, limit } }),
      page,
      limit,
    ),

  listByUser: async (userId: string, page = 1, limit = 20) =>
    normalizePaginatedQuizzes(
      await apiGet<unknown>(`/api/quizzes/user/${userId}`, { params: { page, limit } }),
      page,
      limit,
    ),

  listPublic: async (params: PublicQuizListParams = {}) =>
    normalizePaginatedQuizzes(
      await apiGet<unknown>('/api/quizzes/public', { params }),
      params.page ?? 1,
      params.limit ?? 9,
    ),

  getById: (id: string) => apiGet<Quiz>(`/api/quizzes/${id}`),

  create: (payload: CreateQuizPayload) =>
    apiPost<Quiz>('/api/quizzes', payload),

  update: (id: string, payload: UpdateQuizPayload) =>
    apiPatch<Quiz>(`/api/quizzes/${id}`, payload),

  remove: (id: string) => apiDelete<void>(`/api/quizzes/${id}`),
};
