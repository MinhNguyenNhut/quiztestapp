import { createBrowserRouter, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.tsx';
import QuizListPage from './pages/QuizListPage.tsx';
import QuizEditorPage from './pages/QuizEditorPage.tsx';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <QuizListPage /> },
      { path: 'quiz/new', element: <QuizEditorPage /> },
      { path: 'quiz/:id/edit', element: <QuizEditorPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);
