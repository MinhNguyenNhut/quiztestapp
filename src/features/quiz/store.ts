import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import quizReducer from './quizSlice';
import examReducer from '../exam/examSlice';
import submissionReducer from '../exam/submissionSlice';

export const store = configureStore({
  reducer: {
    quiz: quizReducer,
    exam: examReducer,
    submission: submissionReducer,
  },
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
