import { useEffect, useMemo, useState } from 'react';
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
  Skeleton,
  Snackbar,
  Typography,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form';
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
import { isQuizUnlimitedTime } from '../types/quiz';
import { aggregateDifficulty } from '../utils/quizDisplay';
import { getDefaultCandidateFieldsConfig } from '../shared/constants/defaultCandidateFields';

const HOME_PATH = '/';

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/* -------------------------------------------------------------------------- */
/*  Page (data loading)                                                       */
/* -------------------------------------------------------------------------- */

export default function CandidateInfoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const quizzes = useAppSelector((state) => state.quiz.quizzes);
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
            action={<Button onClick={() => navigate(HOME_PATH)}>{t('common.home')}</Button>}
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
    userCreated: quiz.userCreated,
    description: quiz.description,
    coverImage: quiz.coverImage,
    estimatedTime: quiz.estimatedTime ?? 30,
    questionCount: quiz.questionCount ?? quiz.questions?.length ?? 0,
    passingScore: quiz.passingScore ?? 0,
    difficulty: aggregateDifficulty(quiz.questions ?? []) ?? 'medium',
    createdBy: quiz.createdBy ?? 'Unknown',
    createdAt: quiz.createdAt,
    unlimitedTime: isQuizUnlimitedTime(quiz),
  };

  const fieldsConfig =
    quiz.candidateFieldsConfig ?? getDefaultCandidateFieldsConfig(i18n.language);

  return (
    <CandidateInfoForm
      quiz={quizOverview}
      fieldsConfig={fieldsConfig}
      onBack={() => navigate(HOME_PATH)}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Layout + submit logic                                                     */
/* -------------------------------------------------------------------------- */

interface CandidateInfoFormProps {
  quiz: QuizOverview;
  fieldsConfig: CandidateFieldsConfig;
  onBack: () => void;
  isLoading?: boolean;
}

function CandidateInfoForm({
  quiz,
  fieldsConfig,
  onBack,
  isLoading = false,
}: CandidateInfoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const storedQuizzes = useAppSelector((state) => state.quiz.quizzes);
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

  const { handleSubmit } = methods;

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

      let questions = [...fullQuiz.questions];
      const settings = fullQuiz.settings;

      if (settings?.shuffleQuestions) questions = shuffleArray(questions);
      if (settings?.shuffleOptions) {
        questions = questions.map((q) => ({ ...q, options: shuffleArray([...q.options]) }));
      }

      // 0 disables the timer when the quiz has unlimited time
      const estimatedMinutes = isQuizUnlimitedTime(fullQuiz) ? 0 : fullQuiz.estimatedTime;

      dispatch(
        startSession({
          quizId: fullQuiz.id,
          questions,
          estimatedMinutes,
          candidate: data,
        }),
      );

      navigate(`/quiz/${fullQuiz.id}/exam`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #eef2ff 0%, #f8fafc 320px, #f1f5f9 100%)',
      }}
    >
      {/* ---------- Top bar with back button ---------- */}
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          bgcolor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1 }}
        >
          <Button
            onClick={onBack}
            startIcon={<ArrowBack />}
            color="inherit"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
          >
            {t('common.backToHome', 'Back to home')}
          </Button>

          <Typography
            noWrap
            variant="body2"
            color="text.secondary"
            sx={{ ml: 'auto', maxWidth: 360, display: { xs: 'none', sm: 'block' } }}
          >
            {quiz.title}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, md: 3 } }}>
        <Fade in timeout={500}>
          <Box>
            {/* ---------- Hero ---------- */}
            <Box sx={{ mb: { xs: 3, md: 5 }, textAlign: { xs: 'left', md: 'center' } }}>
              <Typography
                variant="overline"
                color="primary"
                sx={{ fontWeight: 700, letterSpacing: 1.2 }}
              >
                {t('candidate.stepLabel', 'Step 1 of 2')}
              </Typography>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
                {t('candidate.title')}
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 560, mx: { md: 'auto' } }}>
                {t(
                  'candidate.subtitle',
                  'Please complete the form below to start the exam.',
                )}
              </Typography>
            </Box>

            <Grid container spacing={{ xs: 3, md: 4 }} sx={{ alignItems: 'flex-start' }}>
              {/* ---------- Quiz overview ---------- */}
              <Grid size={{ xs: 12, md: 5, lg: 4 }}>
                <Box sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>
                  <QuizOverviewCard quiz={quiz} unlimitedTime={isQuizUnlimitedTime(quiz)} />
                </Box>
              </Grid>

              {/* ---------- Form ---------- */}
              <Grid size={{ xs: 12, md: 7, lg: 8 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2.5, sm: 4 },
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 8px 32px -8px rgb(15 23 42 / 0.10)',
                  }}
                >
                  <FormProvider {...methods}>
                    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
                      <CandidateFormFields
                        fieldsConfig={fieldsConfig}
                        isLoading={isLoading}
                      />
                      <StartExamButton isSubmitting={isSubmitting} />
                    </form>
                  </FormProvider>
                </Paper>
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

/* -------------------------------------------------------------------------- */
/*  Form fields                                                               */
/* -------------------------------------------------------------------------- */

interface CandidateFormFieldsProps {
  fieldsConfig: CandidateFieldsConfig;
  isLoading?: boolean;
}

function CandidateFormFields({ fieldsConfig, isLoading }: CandidateFormFieldsProps) {
  const { fields, sections } = fieldsConfig;
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CandidateFormValues>();

  // Subscribe locally so only this component re-renders on input
  const formValues = useWatch({ control });

  const groupedFields = useMemo(() => {
    const isVisible = (field: CandidateField): boolean => {
      if (!field.visibleIf) return true;
      return formValues[field.visibleIf.fieldId] === field.visibleIf.equals;
    };
    const byOrder = (a: CandidateField, b: CandidateField) =>
      (a.order || 0) - (b.order || 0);

    if (sections?.length) {
      return sections.map((section) => ({
        id: section.id,
        title: section.title as string | undefined,
        fields: fields.filter((f) => f.section === section.id).filter(isVisible).sort(byOrder),
      }));
    }
    return [{ id: 'default', title: undefined as string | undefined, fields: fields.filter(isVisible) }];
  }, [fields, sections, formValues]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" height={56} />
        ))}
      </Box>
    );
  }

  const showNumbers = groupedFields.length > 1;

  return (
    <Box sx={{ mb: 2 }}>
      {groupedFields
        .filter((section) => section.fields.length > 0)
        .map((section, index) => (
          <Box key={section.id} sx={{ mb: 4 }}>
            {section.title && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                {showNumbers && (
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </Box>
                )}
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {section.title}
                </Typography>
              </Box>
            )}

            <Grid container spacing={2}>
              {section.fields.map((field) => (
                <Grid size={{ xs: 12, sm: field.type === 'textarea' ? 12 : 6 }} key={field.id}>
                  <DynamicFieldRenderer
                    field={field}
                    register={register}
                    watch={watch}
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