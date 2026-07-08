/**
 * Route component for /quiz/:id/exam. Looks up the quiz, guards against
 * a missing or mismatched session (redirects to the candidate page),
 * scores + records the submission when the candidate submits, and
 * routes to the result page.
 */
import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Alert, Button } from '@mui/material';
import { useAppDispatch, useAppSelector } from '../features/quiz/store';
import { getQuizzes } from '../features/quiz/quizSlice';
import {
  getExamSession,
  submitSession,
} from '../features/exam/examSlice';
import { recordSubmission } from '../features/exam/submissionSlice';
import type { Submission } from '../types/submission';
import ExamPage from '../features/exam/ExamPage';

export default function ExamDemoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const quizzes = useAppSelector(getQuizzes);
  const session = useAppSelector(getExamSession);

  const quiz = quizzes.find((q) => q.id === id) ?? null;

  // If we land on this route without an active session for this quiz,
  // send the candidate back to fill out the candidate form first.
  // A session that IS for this quiz — submitted or not — is allowed to
  // render here (a submitted session briefly renders while the submit
  // handler finishes navigating to the result page).
  useEffect(() => {
    if (!quiz) return;
    if (session.quizId === quiz.id) return;
    navigate(`/quiz/${quiz.id}/candidate`, { replace: true });
  }, [quiz, session.quizId, navigate]);


  const handleSubmit = useCallback(
    (submission: Submission) => {
      dispatch(recordSubmission(submission));
      dispatch(submitSession());

      navigate(
        `/quiz/${submission.quizId}/result/${submission.id}`,
        { replace: true }
      );
    },
    [dispatch, navigate]
  );

  if (!quiz) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/')}>
              Go home
            </Button>
          }
        >
          Quiz not found.
        </Alert>
      </Box>
    );
  }

  if (session.quizId !== quiz.id) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="info">Loading exam…</Alert>
      </Box>
    );
  }

  return <ExamPage quiz={quiz} onSubmit={handleSubmit} />;
}
