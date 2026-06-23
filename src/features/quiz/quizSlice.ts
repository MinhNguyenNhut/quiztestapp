import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Quiz, Question } from '../../types/index.ts';

interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: QuizState = {
  quizzes: [],
  currentQuiz: null,
  isLoading: false,
  error: null,
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setQuizzes(state, action: PayloadAction<Quiz[]>) {
      state.quizzes = action.payload;
    },
    setCurrentQuiz(state, action: PayloadAction<Quiz | null>) {
      state.currentQuiz = action.payload;
    },
    addQuiz(state, action: PayloadAction<Quiz>) {
      state.quizzes.push(action.payload);
    },
    updateQuiz(state, action: PayloadAction<Quiz>) {
      const index = state.quizzes.findIndex((q) => q.id === action.payload.id);
      if (index !== -1) {
        state.quizzes[index] = action.payload;
      }
      if (state.currentQuiz?.id === action.payload.id) {
        state.currentQuiz = action.payload;
      }
    },
    deleteQuiz(state, action: PayloadAction<string>) {
      state.quizzes = state.quizzes.filter((q) => q.id !== action.payload);
      if (state.currentQuiz?.id === action.payload) {
        state.currentQuiz = null;
      }
    },
    reorderQuestions(state, action: PayloadAction<{ quizId: string; questions: Question[] }>) {
      const quiz = state.quizzes.find((q) => q.id === action.payload.quizId);
      if (quiz) {
        quiz.questions = action.payload.questions;
      }
    },
  },
});

export const {
  setLoading,
  setError,
  setQuizzes,
  setCurrentQuiz,
  addQuiz,
  updateQuiz,
  deleteQuiz,
  reorderQuestions,
} = quizSlice.actions;

export default quizSlice.reducer;
