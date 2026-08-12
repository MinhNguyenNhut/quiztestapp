import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';
import LoginPage from './pages/LoginPage.tsx';
import QuizListPage from './pages/QuizListPage.tsx';
import QuizEditorPage from './pages/QuizEditorPage.tsx';
import CandidateInfoPage from './pages/CandidateInfoPage.tsx';
import ExamPage from './pages/ExamPage.tsx';
import ResultPage from './pages/ResultPage.tsx';
import SubmissionsDashboardPage from './pages/SubmissionsDashboardPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import ProfilePage from './pages/ProfilePage';

export const router = createBrowserRouter([
  { path: 'login', element: <LoginPage /> },
  { path: 'register', element: <RegisterPage /> },
  { path: 'profile', element: <ProfilePage /> },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <QuizListPage /> },
      { path: 'quiz/new', element: <QuizEditorPage /> },
      { path: 'quiz/:id/edit', element: <QuizEditorPage /> },
      { path: 'quiz/:id/submissions', element: <SubmissionsDashboardPage /> },
    ],
  },
  { path: 'quiz/:id/candidate', element: <CandidateInfoPage /> },
  { path: 'quiz/:id/exam', element: <ExamPage /> },
  { path: 'quiz/:id/result/:submissionId', element: <ResultPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
