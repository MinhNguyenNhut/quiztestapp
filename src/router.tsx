import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.tsx';
import QuizListPage from './pages/QuizListPage.tsx';
import QuizEditorPage from './pages/QuizEditorPage.tsx';
import CandidateInfoPage from './pages/CandidateInfoPage.tsx';
import ExamPage from './pages/ExamPage.tsx';
import ResultPage from './pages/ResultPage.tsx';
import SubmissionsDashboardPage from './pages/SubmissionsDashboardPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <QuizListPage /> },
      { path: 'quiz/new', element: <QuizEditorPage /> },
      { path: 'quiz/:id/edit', element: <QuizEditorPage /> },
      { path: 'quiz/:id/candidate', element: <CandidateInfoPage /> },
      { path: 'quiz/:id/exam', element: <ExamPage /> },
      { path: 'quiz/:id/result/:submissionId', element: <ResultPage /> },
      { path: 'quiz/:id/submissions', element: <SubmissionsDashboardPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
