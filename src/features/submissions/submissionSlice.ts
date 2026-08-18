import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { Submission } from '../../types/submission';
import type { AnyAnswer } from '../../types/answer';
import type { CandidateFormValues } from '../../types/candidate';
import { submissionApi } from '../../api/submissionApi.ts';

interface SubmissionState {
  current: Submission | null;
  history: Submission[];
  /** Per-submission save status (exposed so the exam page can read it). */
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  saveError: string | null;
}

const initialState: SubmissionState = {
  current: null,
  history: [],
  saveStatus: 'idle',
  saveError: null,
};

const rejectMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

const upsert = (history: Submission[], submission: Submission): Submission[] => {
  const idx = history.findIndex((s) => s.id === submission.id);
  if (idx === -1) return [...history, submission];
  const copy = history.slice();
  copy[idx] = submission;
  return copy;
};

// ---- Thunks ----

/** POST /api/submissions */
export const createSubmission = createAsyncThunk<
  Submission,
  { quizId: string; candidate: CandidateFormValues; answers?: Record<string, AnyAnswer> },
  { rejectValue: string }
>('submissions/create', async (payload, { rejectWithValue }) => {
  try {
    return await submissionApi.create({
      quizId: payload.quizId,
      candidate: payload.candidate,
      answers: payload.answers ?? {},
    });
  } catch (err) {
    return rejectWithValue(rejectMessage(err, 'Failed to start submission'));
  }
});

/** GET /api/submissions/:id */
export const fetchSubmission = createAsyncThunk<Submission, string, { rejectValue: string }>(
  'submissions/fetch',
  async (id, { rejectWithValue }) => {
    try {
      return await submissionApi.getById(id);
    } catch (err) {
      return rejectWithValue(rejectMessage(err, 'Failed to load submission'));
    }
  },
);

/** PATCH /api/submissions/:id/answer — used as the autosave target. */
export const saveAnswer = createAsyncThunk<
  Submission,
  { submissionId: string; questionId: string; value: AnyAnswer },
  { rejectValue: string }
>('submissions/saveAnswer', async ({ submissionId, questionId, value }, { rejectWithValue }) => {
  try {
    return await submissionApi.saveAnswer(submissionId, { questionId, value });
  } catch (err) {
    return rejectWithValue(rejectMessage(err, 'Failed to save answer'));
  }
});

/** PATCH /api/submissions/:id/flag */
export const toggleFlag = createAsyncThunk<
  Submission,
  { submissionId: string; questionId: string },
  { rejectValue: string }
>('submissions/toggleFlag', async ({ submissionId, questionId }, { rejectWithValue }) => {
  try {
    return await submissionApi.toggleFlag(submissionId, questionId);
  } catch (err) {
    return rejectWithValue(rejectMessage(err, 'Failed to toggle flag'));
  }
});

/** PATCH /api/submissions/:id/bookmark */
export const toggleBookmark = createAsyncThunk<
  Submission,
  { submissionId: string; questionId: string },
  { rejectValue: string }
>('submissions/toggleBookmark', async ({ submissionId, questionId }, { rejectWithValue }) => {
  try {
    return await submissionApi.toggleBookmark(submissionId, questionId);
  } catch (err) {
    return rejectWithValue(rejectMessage(err, 'Failed to toggle bookmark'));
  }
});

/** POST /api/submissions/:id/submit */
export const submitSubmission = createAsyncThunk<
  Submission,
  { submissionId: string; answers?: Record<string, AnyAnswer>; force?: boolean },
  { rejectValue: string }
>(
  'submissions/submit',
  async ({ submissionId, answers, force }, { rejectWithValue }) => {
    try {
      return await submissionApi.submit(submissionId, { answers, force });
    } catch (err) {
      return rejectWithValue(rejectMessage(err, 'Failed to submit'));
    }
  },
);

/** GET /api/submissions/quiz/:quizId */
export const fetchSubmissionsByQuiz = createAsyncThunk<Submission[], string, { rejectValue: string }>(
  'submissions/fetchByQuiz',
  async (quizId, { rejectWithValue }) => {
    try {
      return await submissionApi.listByQuiz(quizId);
    } catch (err) {
      return rejectWithValue(rejectMessage(err, 'Failed to load submissions'));
    }
  },
);

const submissionSlice = createSlice({
  name: 'submission',
  initialState,
  reducers: {
    recordSubmission(state, action: PayloadAction<Submission>) {
      const submission = action.payload;
      state.current = submission;
      state.history = upsert(state.history, submission);
    },
    clearCurrent(state) {
      state.current = null;
    },
    deleteSubmission(state, action: PayloadAction<string>) {
      const submissionId = action.payload;
      state.history = state.history.filter((s) => s.id !== submissionId);
      if (state.current?.id === submissionId) state.current = null;
    },
    clearSaveError(state) {
      state.saveError = null;
      state.saveStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // createSubmission
      .addCase(createSubmission.pending, (state) => {
        state.saveStatus = 'saving';
        state.saveError = null;
      })
      .addCase(createSubmission.fulfilled, (state, action) => {
        state.saveStatus = 'saved';
        const s = action.payload;
        state.current = s;
        state.history = upsert(state.history, s);
      })
      .addCase(createSubmission.rejected, (state, action) => {
        state.saveStatus = 'error';
        state.saveError = action.payload ?? action.error.message ?? 'Failed to start submission';
      })

      // fetchSubmission
      .addCase(fetchSubmission.fulfilled, (state, action) => {
        const s = action.payload;
        state.current = s;
        state.history = upsert(state.history, s);
      })

      // saveAnswer — primary autosave lifecycle.
      .addCase(saveAnswer.pending, (state) => {
        state.saveStatus = 'saving';
        state.saveError = null;
      })
      .addCase(saveAnswer.fulfilled, (state, action) => {
        state.saveStatus = 'saved';
        const s = action.payload;
        state.current = s;
        state.history = upsert(state.history, s);
      })
      .addCase(saveAnswer.rejected, (state, action) => {
        state.saveStatus = 'error';
        state.saveError = action.payload ?? action.error.message ?? 'Failed to save answer';
      })

      // toggleFlag / toggleBookmark
      .addCase(toggleFlag.fulfilled, (state, action) => {
        const s = action.payload;
        if (state.current?.id === s.id) state.current = s;
        state.history = upsert(state.history, s);
      })
      .addCase(toggleBookmark.fulfilled, (state, action) => {
        const s = action.payload;
        if (state.current?.id === s.id) state.current = s;
        state.history = upsert(state.history, s);
      })

      // submitSubmission
      .addCase(submitSubmission.fulfilled, (state, action) => {
        const s = action.payload;
        state.current = s;
        state.history = upsert(state.history, s);
      })

      // fetchSubmissionsByQuiz — replaces the quiz's history slice.
      .addCase(fetchSubmissionsByQuiz.fulfilled, (state, action) => {
        const quizId = action.meta.arg;
        // Drop the existing entries for this quiz, keep everything else.
        const others = state.history.filter((s) => s.quizId !== quizId);
        state.history = [...others, ...action.payload];
      });
  },
});

export const { recordSubmission, clearCurrent, deleteSubmission, clearSaveError } = submissionSlice.actions;

export const getCurrentSubmission = (state: {
  submission: SubmissionState;
}): Submission | null => state.submission.current;

export const getSubmissionHistory = (state: {
  submission: SubmissionState;
}): Submission[] => state.submission.history;

export const getSaveStatus = (state: {
  submission: SubmissionState;
}) => state.submission.saveStatus;

export const getSaveError = (state: {
  submission: SubmissionState;
}) => state.submission.saveError;

export default submissionSlice.reducer;
