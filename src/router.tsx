import { createBrowserRouter } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout.tsx';
import QuizListPage from './pages/QuizListPage.tsx';
import QuizEditorPage from './pages/QuizEditorPage.tsx';
import CandidateInfoDemoPage from './pages/CandidateInfoDemoPage.tsx';
import ExamDemoPage from './pages/ExamDemoPage.tsx';
import ResultDemoPage from './pages/ResultDemoPage.tsx';
import SubmissionsDashboardPage from './pages/SubmissionsDashboardPage.tsx';
import NotFoundPage from './pages/NotFoundPage.tsx';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <QuizListPage /> },
      { path: 'quiz/new', element: <QuizEditorPage /> },
      { path: 'quiz/:id/edit', element: <QuizEditorPage /> },
      { path: 'quiz/:id/candidate', element: <CandidateInfoDemoPage /> },
      { path: 'quiz/:id/exam', element: <ExamDemoPage /> },
      { path: 'quiz/:id/result/:submissionId', element: <ResultDemoPage /> },
      { path: 'quiz/:id/submissions', element: <SubmissionsDashboardPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
