import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Alert,
  CircularProgress,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HomeIcon from '@mui/icons-material/Home';
import { useAppDispatch, useAppSelector } from '../features/store';
import { isQuizUnlimitedTime } from '../types/quiz';
import { QuestionReviewAccordion } from '../components/result/QuestionReviewAccordion';
import { fetchQuizById } from '../features/quiz/quizSlice';
import { fetchQuestionsForQuiz } from '../features/questions/questionThunks';
import type { Quiz } from '../types';
import type { PerQuestionResult } from '../shared/utils/scoring';
import type { Question } from '../types/quiz';

const EMPTY_QUESTIONS: Question[] = [];

export default function QuizPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const quizzes = useAppSelector(state => state.quiz.quizzes);
  const questions = useAppSelector((state) =>
    id ? state.questions.questionsByQuizId[id] ?? EMPTY_QUESTIONS : EMPTY_QUESTIONS
  );
  const isLoading = useAppSelector((state) => state.quiz.isLoading || state.questions.isLoading);

  const quiz: Quiz | null = useMemo(
    () => quizzes.find((q) => q.id === id) ?? null,
    [quizzes, id]
  );

  useEffect(() => {
    if (id) {
      void dispatch(fetchQuizById(id));
      void dispatch(fetchQuestionsForQuiz(id));
    }
  }, [dispatch, id]);

  // Create a fake submission with all answers as null to show the correct answers
  const safeAnswers = useMemo(() => ({}), []);

  // Create mock results showing correct answers for preview
  const previewResults = useMemo((): PerQuestionResult[] => {
    return questions.map((q: Question) => ({
      questionId: q.id,
      question: q,
      pointsPossible: q.points,
      pointsEarned: q.points, // Show full points for correct answers
      result: {
        isCorrect: true,
        isPartial: false,
        pointsEarned: 1,
        ungraded: false,
      },
    }));
  }, [questions]);

  if (isLoading && !quiz) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!quiz) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/')}>
              {t('common.goHome')}
            </Button>
          }
        >
          {t('errors.quizNotFound')}
        </Alert>
      </Box>
    );
  }

  const settings = quiz.settings;
  const questionCount = quiz.questionCount ?? questions.length ?? 0;
  const unlimitedTime = isQuizUnlimitedTime(quiz);
  const estimatedMinutes = quiz.estimatedTime ?? 0;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        py: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ mx: 'auto', px: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Card variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {quiz.title || t('quizList.untitledQuiz')}
                </Typography>
                {quiz.description && (
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 1.5 }}>
                    {quiz.description}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  <Chip
                    size="small"
                    label={t('quizList.questions', { count: questionCount })}
                    variant="outlined"
                  />
                  {settings?.shuffleQuestions && (
                    <Chip
                      size="small"
                      label={t('quizPreview.shuffleQuestions')}
                      variant="outlined"
                      color="primary"
                    />
                  )}
                  {settings?.shuffleOptions && (
                    <Chip
                      size="small"
                      label={t('quizPreview.shuffleOptions')}
                      variant="outlined"
                      color="primary"
                    />
                  )}
                  <Chip
                    size="small"
                    label={unlimitedTime ? t('quizList.unlimitedTime') : t('quizList.minutes', { count: estimatedMinutes })}
                    variant="outlined"
                    sx={unlimitedTime ? { bgcolor: 'success.light', color: 'success.dark' } : {}}
                  />
                  <Chip
                    size="small"
                    label={settings?.allowBackwardNavigation !== false ? t('quizPreview.backwardNavigation') : t('quizPreview.noBackwardNavigation')}
                    variant="outlined"
                  />
                  <Chip
                    size="small"
                    label={t('quizPreview.passingScore', { score: settings?.passingScorePercentage ?? 70 })}
                    variant="outlined"
                  />
                </Stack>
              </Box>
              <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/quiz/${quiz.id}/edit`)}
                >
                  {t('common.edit')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate(`/quiz/${quiz.id}/candidate`)}
                >
                  {t('quizPreview.startExam')}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Questions with Answers */}
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          <CardContent>
            <QuestionReviewAccordion
              results={previewResults}
              candidateAnswers={safeAnswers}
              showCorrectAnswers={true}
              showExplanations={settings?.showExplanations !== false}
              preview={true}
            />
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <Card variant="outlined" sx={{ mt: 3, borderRadius: 3, '@media print': { display: 'none' } }}>
          <CardContent>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{
                justifyContent: 'space-between',
                alignItems: 'stretch',
                flexWrap: 'wrap',
              }}
              useFlexGap
            >
              <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }} useFlexGap>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/quiz/${quiz.id}/edit`)}
                >
                  {t('common.edit')}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate(`/quiz/${quiz.id}/candidate`)}
                >
                  {t('quizPreview.startExam')}
                </Button>
              </Stack>
              <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }} useFlexGap>
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={() => navigate('/')}
                >
                  {t('common.goHome')}
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}