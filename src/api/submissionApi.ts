/**
 * Submission-API client.
 *
 * Submissions are public-facing on the candidate side — quiz-builder /
 * submissions-dashboard pages are auth-gated, but candidates hit these
 * endpoints without a token. Endpoints that the candidate hits with a
 * valid session pass `withAuth: false`; admin-side reads
 * (e.g. fetchSubmissionsByQuiz) use the default authenticated path.
 */
import type { AnyAnswer } from '../types/answer';
import type { CandidateFormValues } from '../types/candidate';
import type { Submission } from '../types/submission';
import { apiGet, apiPatch, apiPost } from './httpClient';

export interface CreateSubmissionPayload {
  quizId: string;
  candidate: CandidateFormValues;
  answers: Record<string, AnyAnswer>;
  flags?: string[];
  bookmarks?: string[];
}

export interface SaveAnswerPayload {
  questionId: string;
  value: AnyAnswer;
}

export const submissionApi = {
  /** POST /api/submissions — candidates hit this anonymously. */
  create: (payload: CreateSubmissionPayload) =>
    apiPost<Submission>('/api/submissions', payload, { withAuth: false }),

  /** GET /api/submissions/:id — public for the result page. */
  getById: (id: string) =>
    apiGet<Submission>(`/api/submissions/${id}`, { withAuth: false }),

  /** PATCH /api/submissions/:id/answer — anonymous. */
  saveAnswer: (id: string, payload: SaveAnswerPayload) =>
    apiPatch<Submission>(`/api/submissions/${id}/answer`, payload, { withAuth: false }),

  /** PATCH /api/submissions/:id/flag — anonymous. */
  toggleFlag: (id: string, questionId: string) =>
    apiPatch<Submission>(`/api/submissions/${id}/flag`, { questionId }, { withAuth: false }),

  /** PATCH /api/submissions/:id/bookmark — anonymous. */
  toggleBookmark: (id: string, questionId: string) =>
    apiPatch<Submission>(`/api/submissions/${id}/bookmark`, { questionId }, { withAuth: false }),

  /** POST /api/submissions/:id/submit — anonymous. */
  submit: (id: string, payload: { answers?: Record<string, AnyAnswer>; force?: boolean } = {}) =>
    apiPost<Submission>(`/api/submissions/${id}/submit`, payload, { withAuth: false }),

  /** GET /api/submissions/quiz/:quizId — admin/submissions dashboard, authenticated. */
  listByQuiz: (quizId: string) =>
    apiGet<Submission[]>(`/api/submissions/quiz/${quizId}`),
};
