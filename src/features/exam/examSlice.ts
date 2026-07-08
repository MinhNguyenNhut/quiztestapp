import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AnyAnswer, Answer } from '../../types/answer';
import type { Question } from '../../types/quiz';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface ExamSessionState {
  quizId: string | null;
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, AnyAnswer>;
  flags: string[];
  bookmarks: string[];
  startedAt: string | null;
  durationSeconds: number;
  remainingSeconds: number;
  autoSaveStatus: AutoSaveStatus;
  isFullscreen: boolean;
  reviewMode: boolean;
  isSubmitted: boolean;
  /** Candidate info captured before the session started. */
  candidate: Record<string, string | number | boolean | string[] | undefined> | null;
}

const initialState: ExamSessionState = {
  quizId: null,
  questionIds: [],
  currentIndex: 0,
  answers: {},
  flags: [],
  bookmarks: [],
  startedAt: null,
  durationSeconds: 0,
  remainingSeconds: 0,
  autoSaveStatus: 'idle',
  isFullscreen: false,
  reviewMode: false,
  isSubmitted: false,
  candidate: null,
};

interface StartSessionPayload {
  quizId: string;
  questions: Question[];
  estimatedMinutes?: number;
  candidate: Record<string, string | number | boolean | string[] | undefined>;
}

interface SetAnswerPayload {
  questionId: string;
  value: Answer;
}

const clampIndex = (idx: number, total: number): number => {
  if (total <= 0) return 0;
  if (idx < 0) return 0;
  if (idx >= total) return total - 1;
  return idx;
};

const examSlice = createSlice({
  name: 'exam',
  initialState,
  reducers: {
    startSession(state, action: PayloadAction<StartSessionPayload>) {
      const { quizId, questions, estimatedMinutes, candidate } = action.payload;
      const duration = (estimatedMinutes ?? 30) * 60;
      state.quizId = quizId;
      state.questionIds = questions.map((q) => q.id);
      state.currentIndex = 0;
      state.answers = {};
      state.flags = [];
      state.bookmarks = [];
      state.startedAt = new Date().toISOString();
      state.durationSeconds = duration;
      state.remainingSeconds = duration;
      state.autoSaveStatus = 'idle';
      state.isFullscreen = false;
      state.reviewMode = false;
      state.isSubmitted = false;
      state.candidate = candidate;
    },
    goToQuestion(state, action: PayloadAction<number>) {
      state.currentIndex = clampIndex(action.payload, state.questionIds.length);
    },
    nextQuestion(state) {
      state.currentIndex = clampIndex(
        state.currentIndex + 1,
        state.questionIds.length,
      );
    },
    previousQuestion(state) {
      state.currentIndex = clampIndex(
        state.currentIndex - 1,
        state.questionIds.length,
      );
    },
    setAnswer(state, action: PayloadAction<SetAnswerPayload>) {
      state.answers[action.payload.questionId] = action.payload.value;
    },
    clearAnswer(state, action: PayloadAction<string>) {
      delete state.answers[action.payload];
    },
    toggleFlag(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.flags.indexOf(id);
      if (idx === -1) state.flags.push(id);
      else state.flags.splice(idx, 1);
    },
    toggleBookmark(state, action: PayloadAction<string>) {
      const id = action.payload;
      const idx = state.bookmarks.indexOf(id);
      if (idx === -1) state.bookmarks.push(id);
      else state.bookmarks.splice(idx, 1);
    },
    tickTimer(state, action: PayloadAction<number>) {
      state.remainingSeconds = Math.max(0, action.payload);
    },
    expireTimer(state) {
      state.remainingSeconds = 0;
      state.isSubmitted = true;
    },
    setAutoSaveStatus(state, action: PayloadAction<AutoSaveStatus>) {
      state.autoSaveStatus = action.payload;
    },
    toggleFullscreen(state) {
      state.isFullscreen = !state.isFullscreen;
    },
    setReviewMode(state, action: PayloadAction<boolean>) {
      state.reviewMode = action.payload;
    },
    submitSession(state) {
      state.isSubmitted = true;
    },
    /** Replace the whole session (used by the auto-save rehydrate on mount). */
    hydrateSession(_state, action: PayloadAction<ExamSessionState>) {
      return action.payload;
    },
    resetSession() {
      return initialState;
    },
  },
});

export const {
  startSession,
  goToQuestion,
  nextQuestion,
  previousQuestion,
  setAnswer,
  clearAnswer,
  toggleFlag,
  toggleBookmark,
  tickTimer,
  expireTimer,
  setAutoSaveStatus,
  toggleFullscreen,
  setReviewMode,
  submitSession,
  hydrateSession,
  resetSession,
} = examSlice.actions;

export const getExamSession = (state: { exam: ExamSessionState }): ExamSessionState =>
  state.exam;

export const getCurrentQuestionId = (state: { exam: ExamSessionState }): string | null =>
  state.exam.questionIds[state.exam.currentIndex] ?? null;

export default examSlice.reducer;
