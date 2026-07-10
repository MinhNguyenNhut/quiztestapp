import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Submission } from '../../types/submission';

interface SubmissionState {
  current: Submission | null;
  history: Submission[];
}

const initialState: SubmissionState = {
  current: null,
  history: [],
};

const submissionSlice = createSlice({
  name: 'submission',
  initialState,
  reducers: {
    recordSubmission(state, action: PayloadAction<Submission>) {
      const submission = action.payload;
      state.current = submission;
      const idx = state.history.findIndex((s) => s.id === submission.id);
      if (idx === -1) {
        state.history.push(submission);
      } else {
        state.history[idx] = submission;
      }
    },
    clearCurrent(state) {
      state.current = null;
    },
    deleteSubmission(state, action: PayloadAction<string>) {
      const submissionId = action.payload;
      state.history = state.history.filter((s) => s.id !== submissionId);
      if (state.current?.id === submissionId) {
        state.current = null;
      }
    },
  },
});

export const { recordSubmission, clearCurrent, deleteSubmission } = submissionSlice.actions;

export const getCurrentSubmission = (state: {
  submission: SubmissionState;
}): Submission | null => state.submission.current;

export const getSubmissionHistory = (state: {
  submission: SubmissionState;
}): Submission[] => state.submission.history;

export default submissionSlice.reducer;
