/**
 * Route component for /quiz/:id/result/:submissionId.
 * Reads the current submission from the submission slice
 * and renders the result page.
 */
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Button } from '@mui/material';
import { useAppSelector } from '../features/quiz/store';
import { getQuizzes } from '../features/quiz/quizSlice';
import { getSubmissionHistory } from '../features/exam/submissionSlice';
import ResultPage from '../features/results/ResultPage';

export default function ResultDemoPage() {
  const { id, submissionId } = useParams();

  const navigate = useNavigate();
  const quizzes = useAppSelector(getQuizzes);
  const submissions = useAppSelector(getSubmissionHistory);
  const submission = submissions.find(s => s.id === submissionId) ?? null;
  const quiz = quizzes.find((q) => q.id === id) ?? null;

  useEffect(() => {
    if (!quiz) return;
    if (submission) return;

    navigate(`/quiz/${quiz.id}/candidate`, { replace: true });
  }, [quiz, submission, navigate]);

  if (!quiz) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error">
          Quiz not found. <Button onClick={() => navigate('/')}>Go home</Button>
        </Alert>
      </Box>
    );
  }

  if (!submission) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="info">Loading result…</Alert>
      </Box>
    );
  }

  if (submission.quizId !== quiz.id) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="warning" action={<Button onClick={() => navigate('/')}>Home</Button>}>
          The result belongs to a different quiz.
        </Alert>
      </Box>
    );
  }

  return <ResultPage quiz={quiz} submission={submission} />;
}
