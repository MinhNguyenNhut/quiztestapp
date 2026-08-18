// features/questions/questionSlice.ts

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Question } from '../../types';
import { fetchQuestionsForQuiz } from './questionThunks';

interface QuestionState {
  questionsByQuizId: Record<string, Question[]>;
  isLoading: boolean;
  error: string | null;
}

const initialState: QuestionState = {
  questionsByQuizId: {},
  isLoading: false,
  error: null,
};

const questionSlice = createSlice({
  name: 'questions',
  initialState,
  reducers: {
    clearQuestionsForQuiz: (state, action: PayloadAction<string>) => {
      delete state.questionsByQuizId[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuestionsForQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })

      .addCase(fetchQuestionsForQuiz.fulfilled, (state, action) => {
        state.isLoading = false;

        const { quizId, questions } = action.payload;

        state.questionsByQuizId[quizId] = questions;
      })

      .addCase(fetchQuestionsForQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload ?? 'Failed to load questions';
      });
  },
});

export const {
  clearQuestionsForQuiz,
} = questionSlice.actions;

export default questionSlice.reducer;
