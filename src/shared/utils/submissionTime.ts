import type { Submission } from '../../types/submission';

export function getSubmissionTimeSpentSeconds(submission: Submission): number | undefined {
  const storedDuration = submission.timeSpentSeconds;
  if (typeof storedDuration === 'number' && Number.isFinite(storedDuration) && storedDuration > 0) {
    return storedDuration;
  }

  const startedAt = new Date(submission.startedAt).getTime();
  const submittedAt = submission.submittedAt
    ? new Date(submission.submittedAt).getTime()
    : Number.NaN;
  const timestampDuration = Math.floor((submittedAt - startedAt) / 1000);

  if (Number.isFinite(timestampDuration) && timestampDuration >= 0) {
    return timestampDuration;
  }

  return storedDuration;
}
