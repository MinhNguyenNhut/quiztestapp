/**
 * Exam-session middleware.
 *
 * Bridges the local exam slice to the submissions API:
 *
 *  - `setAnswer`      -> debounce-dispatch `saveAnswer(submissionId, ...)`
 *                        to persist answers off-screen as the candidate
 *                        types. The submissionSlice tracks the lifecycle
 *                        (saving -> saved/error) and examSlice mirrors it
 *                        into `autoSaveStatus`.
 *  - `submitSession`  -> dispatch `submitSubmission` (which POSTs to the
 *                        backend, returning the final submission), then
 *                        dispatch `recordSubmission` to snapshot it into
 *                        history.
 *
 * `saveAnswer` requires a `submissionId` which the exam slice doesn't
 * track locally. The middleware looks at `submission.current?.id` from
 * the store, so candidates MUST dispatch `createSubmission` (e.g. from
 * the candidate-info page) before the first `setAnswer` lands. Without
 * a current submission the middleware silently no-ops the save — the
 * local answer is still preserved in the exam slice, no data lost.
 */
import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import type { TypedStartListening } from '@reduxjs/toolkit';
import type { AppDispatch, RootState } from '../store.ts';
import {
  recordSubmission,
  saveAnswer,
  submitSubmission,
} from '../submissions/submissionSlice.ts';
import { setAnswer, submitSession } from './examSlice.ts';

export const examMiddleware = createListenerMiddleware();

const AUTOSAVE_DEBOUNCE_MS = 600;

type StartAppListening = TypedStartListening<RootState, AppDispatch>;

const startAppListening = examMiddleware.startListening as unknown as StartAppListening;

// Per-session debounce timer — keyed by submissionId so two open tabs
// don't collide.
const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

startAppListening({
  actionCreator: setAnswer,
  effect: async (action, api) => {
    const state = api.getState();
    const submission = state.submission.current;
    if (!submission) return; // not yet submitted to backend

    const { questionId, value } = action.payload;
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

    const result = await api.dispatch(
      submitSubmission({
        submissionId: submission.id,
        answers: session.answers,
        force: false,
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
