import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import quizReducer from './quiz/quizSlice';
import examReducer from './exam/examSlice';
import submissionReducer from './submissions/submissionSlice';
import userReducer from './user/userSlice';
import authReducer from './auth/authSlice';
import questionReducer from './questions/questionSlice';
import { examMiddleware } from './exam/examMiddleware.ts';

export const store = configureStore({
  reducer: {
    quiz: quizReducer,
    questions: questionReducer,
    exam: examReducer,
    submission: submissionReducer,
    user: userReducer,
    auth: authReducer,
  },
  middleware: (getDefault) => getDefault().prepend(examMiddleware.middleware),
  devTools: import.meta.env.DEV,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
