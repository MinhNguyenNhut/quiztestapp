/**
 * Submission data model — written by the exam page on submit, read by
 * the result page.
 */

import type { CandidateFormValues } from './candidate';
import type { AnyAnswer } from './answer';

export type SubmissionStatus = 'in_progress' | 'submitted' | 'expired' | 'graded';

export interface Submission {
  id: string;
  quizId: string;
  candidate: CandidateFormValues;
  /** Map of questionId -> answer. */
  answers: Record<string, AnyAnswer>;
  /** Flagged question ids (orange in the palette). */
  flags: string[];
  /** Bookmarked question ids (rendered with a bookmark icon). */
  bookmarks: string[];
  startedAt: string;
  submittedAt?: string;
  timeSpentSeconds?: number;
  /** Total earned points. */
  score?: number;
  /** 0–100 percentage. */
  percentage?: number;
  status: SubmissionStatus;
}
