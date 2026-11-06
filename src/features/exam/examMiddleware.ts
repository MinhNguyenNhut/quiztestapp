/**
 * Exam-session middleware.
 *
 * Bridges the local exam slice to the submissions API:
 *
 *  - answer updates   -> debounce-dispatch `saveAnswer(submissionId, ...)`
 *                        to persist answers as the candidate types. The
 *                        submissionSlice tracks the lifecycle and examSlice
 *                        mirrors it into `autoSaveStatus`.
 *  - `submitSession`  -> dispatch `submitSubmission` (which POSTs to the
 *                        backend, returning the final submission), then
 *                        dispatch `recordSubmission` to snapshot it into
 *                        history.
 *
 * `saveAnswer` requires a `submissionId` which the exam slice doesn't
 * track locally. The middleware looks at `submission.current?.id` from
 * the store, so candidates MUST dispatch `createSubmission` before the
 * first answer update. Without a current submission the local answer is
 * still preserved in the exam slice.
 */
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import type { TypedStartListening } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../store.ts';
import {
  recordSubmission,
  saveAnswer,
  submitSubmission,
} from '../submissions/submissionSlice.ts';
import { setAnswer, setReadingChildAnswer, submitSession } from './examSlice.ts';

export const examMiddleware = createListenerMiddleware();

const AUTOSAVE_DEBOUNCE_MS = 600;

type StartAppListening = TypedStartListening<RootState, AppDispatch>;

const startAppListening = examMiddleware.startListening as unknown as StartAppListening;

// Per-session debounce timer — keyed by submissionId so two open tabs
// don't collide.
const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

startAppListening({
  matcher: isAnyOf(setAnswer, setReadingChildAnswer),
  effect: async (action, api) => {
    const state = api.getState();
    const submission = state.submission.current;
    if (!submission) return; // not yet submitted to backend

    const { questionId } = action.payload;
    const value = state.exam.answers[questionId];
    if (!value) return;
    const submissionId = submission.id;
    const existing = pendingTimers.get(submissionId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      pendingTimers.delete(submissionId);
      void api.dispatch(saveAnswer({ submissionId, questionId, value }));
    }, AUTOSAVE_DEBOUNCE_MS);

    pendingTimers.set(submissionId, timer);
  },
});

startAppListening({
  actionCreator: submitSession,
  effect: async (_action, api) => {
    const state = api.getState();
    const submission = state.submission.current;
    const session = state.exam;
    if (!submission) return;

    const timeSpentSeconds = session.startedAt
      ? Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000)
      : undefined;

    const result = await api.dispatch(
      submitSubmission({
        submissionId: submission.id,
        timeSpentSeconds,
      }),
    );

    if (submitSubmission.fulfilled.match(result)) {
      api.dispatch(recordSubmission(result.payload));
    }
  },
});

/** Silence unused-isAnyOf import — kept exported for callers that want a
 *  combined matcher for tests. */
export const _examActionMatchers = isAnyOf;
