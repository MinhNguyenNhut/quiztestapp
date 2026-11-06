import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AnyAnswer, Answer } from '../../types/answer';
import { isAnswered } from '../../types/answer';
import type { Question } from '../../types/quiz';
import { saveAnswer, submitSubmission } from '../submissions/submissionSlice.ts';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface ExamSessionState {
  quizId: string | null;
  questionIds: string[];
  currentIndex: number;
  answers: Record<string, AnyAnswer>;
  answeredQuestions: Record<string, true>;
  answeredCount: number;
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
  answeredQuestions: {},
  answeredCount: 0,
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

interface SetReadingChildAnswerPayload {
  questionId: string;
  childQuestionId: string;
  value: AnyAnswer;
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
      state.answeredQuestions = {};
      state.answeredCount = 0;
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
      const { questionId, value } = action.payload;
      const wasAnswered = isAnswered(state.answers[questionId] ?? null);
      const isNowAnswered = isAnswered(value);
      if (wasAnswered !== isNowAnswered) {
        state.answeredCount += isNowAnswered ? 1 : -1;
        if (isNowAnswered) state.answeredQuestions[questionId] = true;
        else delete state.answeredQuestions[questionId];
      }
      state.answers[questionId] = value;
    },
    setReadingChildAnswer(state, action: PayloadAction<SetReadingChildAnswerPayload>) {
      const { questionId, childQuestionId, value } = action.payload;
      const previousAnswer = state.answers[questionId];
      const wasAnswered = isAnswered(previousAnswer ?? null);
      const childAnswers: Record<string, AnyAnswer> =
        previousAnswer?.type === 'reading_comprehension'
          ? { ...previousAnswer.childAnswers }
          : {};

      if (value === null) delete childAnswers[childQuestionId];
      else childAnswers[childQuestionId] = value;

      const nextAnswer: Answer = { type: 'reading_comprehension', childAnswers };
      const isNowAnswered = isAnswered(nextAnswer);
      if (wasAnswered !== isNowAnswered) {
        state.answeredCount += isNowAnswered ? 1 : -1;
        if (isNowAnswered) state.answeredQuestions[questionId] = true;
        else delete state.answeredQuestions[questionId];
      }
      state.answers[questionId] = nextAnswer;
    },
    clearAnswer(state, action: PayloadAction<string>) {
      if (state.answeredQuestions[action.payload]) {
        state.answeredCount = Math.max(0, state.answeredCount - 1);
      }
      delete state.answeredQuestions[action.payload];
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
  extraReducers: (builder) => {
    // Mirror the submission-save lifecycle into the local session so the
    // autosave chip on the exam page reflects the live API status.
    builder
      .addCase(saveAnswer.pending, (state) => {
        state.autoSaveStatus = 'saving';
      })
      .addCase(saveAnswer.fulfilled, (state) => {
        state.autoSaveStatus = 'saved';
      })
      .addCase(saveAnswer.rejected, (state) => {
        state.autoSaveStatus = 'error';
      })
      // Submission completes -> mark the session as submitted locally.
      .addCase(submitSubmission.fulfilled, (state) => {
        state.isSubmitted = true;
      });
  },
});

export const {
  startSession,
  goToQuestion,
  nextQuestion,
  previousQuestion,
  setAnswer,
  setReadingChildAnswer,
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
