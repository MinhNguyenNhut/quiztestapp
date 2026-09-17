import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Fade,
  Grid,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
import type { UseFormRegister } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../features/store';
import { startSession } from '../features/exam/examSlice';
import { fetchQuizById } from '../features/quiz/quizSlice';
import { QuizOverviewCard, StartExamButton } from '../components/candidate-info';
import DynamicFieldRenderer from '../components/candidate-info/DynamicFieldRenderer';
import type {
  CandidateField,
  CandidateFieldsConfig,
  CandidateFormValues,
  QuizOverview,
} from '../types/candidate';
import { getDefaultCandidateFieldsConfig } from '../shared/constants/defaultCandidateFields';

export default function CandidateInfoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const quizzes = useAppSelector(state => state.quiz.quizzes);
  const quiz = quizzes.find((q) => q.id === id);

  const [notFoundId, setNotFoundId] = useState<string | null>(null);
  const notFound = !quiz && notFoundId === id;

  useEffect(() => {
    if (quiz || !id) return;
    let cancelled = false;

    dispatch(fetchQuizById(id))
      .unwrap()
      .catch(() => {
        if (!cancelled) setNotFoundId(id);
      });

    return () => {
      cancelled = true;
    };
  }, [id, quiz, dispatch]);

  if (!quiz) {
    if (!id || notFound) {
      return (
        <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
          <Alert
            severity="error"
            action={<Button onClick={() => navigate('/')}>{t('common.home')}</Button>}
          >
            {t('errors.quizNotFound')}
          </Alert>
        </Box>
      );
    }
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  const quizOverview: QuizOverview = {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    coverImage: quiz.coverImage,
    estimatedTime: quiz.estimatedTime ?? 30,
    questionCount: quiz.questionCount ?? quiz.questions?.length ?? 0,
    passingScore: quiz.passingScore ?? 0,
    difficulty: quiz.difficulty ?? 'medium',
    createdBy: quiz.createdBy ?? 'Unknown',
    createdAt: quiz.createdAt,
    unlimitedTime: quiz.settings?.unlimitedTime ?? false,
  };

  const fieldsConfig = quiz.candidateFieldsConfig ?? getDefaultCandidateFieldsConfig(i18n.language);

  const handleStartQuiz = () => {
    navigate(`/quiz/${quiz.id}/exam`);
  };

  return (
    <CandidateInfoForm
      quiz={quizOverview}
      fieldsConfig={fieldsConfig}
      onStartQuiz={handleStartQuiz}
    />
  );
}

interface CandidateInfoFormProps {
  quiz: QuizOverview;
  fieldsConfig: CandidateFieldsConfig;
  onStartQuiz?: (candidateData: CandidateFormValues) => void;
  isLoading?: boolean;
}

function CandidateInfoForm({
  quiz,
  fieldsConfig,
  onStartQuiz,
  isLoading = false,
}: CandidateInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const storedQuizzes = useAppSelector(state => state.quiz.quizzes);
  const { t } = useTranslation();

  const methods = useForm<CandidateFormValues>({
    mode: 'onBlur',
    defaultValues: fieldsConfig.fields.reduce((acc, field) => {
      acc[field.id] =
        field.type === 'checkbox'
          ? Boolean(field.defaultValue)
          : (field.defaultValue ?? '');
      return acc;
    }, {} as CandidateFormValues),
  });

  const { handleSubmit } = methods; // Removed watch() to prevent parent re-renders

  const handleFormSubmit = async (data: CandidateFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      let fullQuiz = storedQuizzes.find((q) => q.id === quiz.id);

      if (!fullQuiz || !fullQuiz.questions) {
        try {
          fullQuiz = await dispatch(fetchQuizById(quiz.id)).unwrap();
        } catch {
          fullQuiz = undefined;
        }
      }

      if (!fullQuiz || !fullQuiz.questions) {
        setSubmitError(t('errors.quizConfigurationNotFound'));
        return;
      }

      // Apply quiz settings: shuffle questions and options
      let questions = [...(fullQuiz.questions ?? [])];
      const settings = fullQuiz.settings;

      // Shuffle questions if enabled
      if (settings?.shuffleQuestions) {
        questions = shuffleArray(questions);
      }

      // Shuffle options for each question if enabled
      if (settings?.shuffleOptions) {
        questions = questions.map((q) => ({
          ...q,
          options: shuffleArray([...q.options]),
        }));
      }

      // If unlimited time is enabled, pass 0 to disable timer
      const estimatedMinutes = settings?.unlimitedTime ? 0 : fullQuiz.estimatedTime;

      dispatch(
        startSession({
          quizId: fullQuiz.id,
          questions,
          estimatedMinutes,
          candidate: data,
        }),
      );

      if (onStartQuiz) {
        await onStartQuiz(data);
      }
      navigate(`/quiz/${fullQuiz.id}/exam`);
    } finally {
      setIsSubmitting(false);
    }
  };

// Utility function to shuffle array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        py: { xs: 2, md: 4 },
        px: { xs: 2, md: 3 },
      }}
    >
      <Container maxWidth="xl">
        <Fade in timeout={600}>
          <Box>
            <Typography
              variant="h4"
              component="h1"
              align="center"
              sx={{
                mb: 4,
                fontWeight: 700,
                color: 'primary.main',
                display: { xs: 'none', md: 'block' },
              }}
            >
              {t('candidate.title')}
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Fade in timeout={800}>
                  <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
                    <QuizOverviewCard quiz={quiz} unlimitedTime={quiz.unlimitedTime} />
                  </Box>
                </Fade>
              </Grid>

              <Grid size={{ xs: 12, md: 7 }}>
                <Fade in timeout={1000}>
                  <Paper
                    sx={{
                      p: { xs: 2, sm: 3 },
                      borderRadius: 3,
                      boxShadow: '0 4px 24px -4px rgb(0 0 0 / 0.08)',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 3,
                        fontWeight: 600,
                        display: { xs: 'block', md: 'none' },
                      }}
                    >
                      {t('candidate.title')}
                    </Typography>

                    <FormProvider {...methods}>
                      <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
                        <CandidateFormFields
                          fieldsConfig={fieldsConfig}
                          isLoading={isLoading}
                        />

                        <StartExamButton
                          handleSubmit={handleSubmit}
                          onSubmit={handleFormSubmit}
                          isSubmitting={isSubmitting}
                        />
                      </form>
                    </FormProvider>
                  </Paper>
                </Fade>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>

      <Snackbar
        open={Boolean(submitError)}
        autoHideDuration={4000}
        onClose={() => setSubmitError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="error" variant="filled" onClose={() => setSubmitError(null)}>
          {submitError}
        </Alert>
      </Snackbar>
    </Box>
  );
}

interface CandidateFormFieldsProps {
  fieldsConfig: CandidateFieldsConfig;
  isLoading?: boolean;
}

function CandidateFormFields({
  fieldsConfig,
  isLoading,
}: CandidateFormFieldsProps) {
  const { fields, sections } = fieldsConfig;
  const { t } = useTranslation();
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<CandidateFormValues>();

  // Subscribe to form values locally so only this component re-renders
  const formValues = useWatch({ control });

  const isFieldVisible = (field: CandidateField): boolean => {
    if (!field.visibleIf) return true;
    const value = formValues[field.visibleIf.fieldId];
    return value === field.visibleIf.equals;
  };

  const groupedFields = sections?.length
    ? sections.map((section) => ({
      ...section,
      fields: fields
        .filter((f) => f.section === section.id)
        .filter(isFieldVisible)
        .sort((a, b) => (a.order || 0) - (b.order || 0)),
    }))
    : [
      {
        id: 'default',
        title: t('candidate.title'),
        fields: fields.filter(isFieldVisible),
      },
    ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i} sx={{ height: 60, borderRadius: 1, bgcolor: 'grey.200' }} />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      {groupedFields.map((section) => (
        <Box key={section.id} sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: 'primary.main',
              pb: 1,
              borderBottom: '2px solid',
              borderColor: 'primary.light',
              display: 'inline-block',
            }}
          >
            {section.title}
          </Typography>

          <Grid container spacing={2}>
            {section.fields.map((field) => (
              <Grid
                size={{ xs: 12, sm: field.type === 'textarea' ? 12 : 6 }}
                key={field.id}
              >
                <FieldRenderer
                  field={field}
                  register={register}
                  watch={useWatch}
                  setValue={setValue}
                  error={errors[field.id]}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Box>
  );
}

interface FieldRendererProps {
  field: CandidateField;
  register: UseFormRegister<CandidateFormValues>;
  watch: ReturnType<typeof useForm<CandidateFormValues>>['watch'];
  setValue: ReturnType<typeof useForm<CandidateFormValues>>['setValue'];
  error?: import('react-hook-form').FieldError;
}

function FieldRenderer({ field, register, watch, setValue, error }: FieldRendererProps) {
  return (
    <DynamicFieldRenderer
      field={field}
      register={register}
      watch={watch}
      setValue={setValue}
      error={error}
    />
  );
}