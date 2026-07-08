import { Alert, Box, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import CandidateInfoPage from './CandidateInfoPage';
import type {
  QuizOverview,
  CandidateFieldsConfig,
  CandidateFormValues,
} from '../types/candidate';

import { useAppDispatch, useAppSelector } from '../features/quiz/store';
import { getQuizzes } from '../features/quiz/quizSlice';
import { startSession } from '../features/exam/examSlice';

export default function CandidateInfoDemoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const quizzes = useAppSelector(getQuizzes);

  const quiz = quizzes.find((q) => q.id === id);

  if (!quiz) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Alert
          severity="error"
          action={
            <Button onClick={() => navigate('/')}>
              Home
            </Button>
          }
        >
          Quiz not found.
        </Alert>
      </Box>
    );
  }

  const quizOverview: QuizOverview = {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    coverImage: quiz.coverImage,
    estimatedTime: quiz.estimatedTime ?? 30,
    questionCount: quiz.questions.length,
    passingScore: quiz.passingScore ?? 0,
    difficulty: quiz.difficulty ?? 'medium',
    createdBy: quiz.createdBy ?? 'Unknown',
    createdAt: quiz.createdAt,
  };
  // Replace this later if you store candidate fields in Quiz.
  const fieldsConfig: CandidateFieldsConfig = {
    sections: [
      {
        id: 'personal',
        title: 'Personal Information',
        order: 1,
      },
    ],
    fields: [
      {
        id: 'firstname',
        type: 'text',
        label: 'First Name',
        required: true,
        order: 1,
        section: 'personal',
      },
      {
        id: 'lastname',
        type: 'text',
        label: 'Last Name',
        required: true,
        order: 2,
        section: 'personal',
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email',
        required: true,
        order: 3,
        section: 'personal',
      },
    ],
  };

  const handleStartQuiz = (candidate: CandidateFormValues) => {
    dispatch(
      startSession({
        quizId: quiz.id,
        questions: quiz.questions,
        estimatedMinutes: quiz.estimatedTime,
        candidate,
      })
    );

    navigate(`/quiz/${quiz.id}/exam`);
  };

  return (
    <CandidateInfoPage
      quiz={quizOverview}
      fieldsConfig={fieldsConfig}
      onStartQuiz={handleStartQuiz}
    />
  );
}
