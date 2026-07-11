/**
 * Route component for /quiz/:id/candidate.
 *
 * Looks up the quiz from Redux, derives a QuizOverview (metadata-only
 * view used by the form), guards against a missing quiz, and renders
 * the candidate info form. On submit, starts the exam session in
 * Redux and navigates to /quiz/:id/exam.
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  Container,
  Fade,
  Grid,
  Paper,
  Snackbar,
  Typography,
} from '@mui/material';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import type { UseFormRegister } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../features/store';
import { getQuizzes } from '../features/quiz/quizSlice';
import { startSession } from '../features/exam/examSlice';
import { QuizOverviewCard, StartExamButton } from '../components/candidate-info';
import DynamicFieldRenderer from '../components/candidate-info/DynamicFieldRenderer';
import {
  DEFAULT_CANDIDATE_FIELDS_CONFIG,
} from '../shared/constants/defaultCandidateFields';
import type {
  CandidateField,
  CandidateFieldsConfig,
  CandidateFormValues,
  QuizOverview,
} from '../types/candidate';

export default function CandidateInfoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const quizzes = useAppSelector(getQuizzes);
  const quiz = quizzes.find((q) => q.id === id);

  if (!quiz) {
    return (
      <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
        <Alert
          severity="error"
          action={
            <Button onClick={() => navigate('/')}>{t('common.home')}</Button>
          }
        >
          {t('errors.quizNotFound')}
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

  const fieldsConfig =
    quiz.candidateFieldsConfig ?? DEFAULT_CANDIDATE_FIELDS_CONFIG;

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

/**
 * The candidate-info form. Reads/writes form state via react-hook-form,
 * dispatches `startSession` on submit, and delegates any extra
 * post-submit work (e.g. analytics) to `onStartQuiz`.
 */
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
  const storedQuizzes = useAppSelector(getQuizzes);
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

  const { handleSubmit, watch } = methods;
  const formValues = watch();

  const handleFormSubmit = async (data: CandidateFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      // Locate the full Quiz document (questions, points, etc.) for the
      // exam page. The candidate-info "QuizOverview" is metadata-only.
      const fullQuiz = storedQuizzes.find((q) => q.id === quiz.id);
      if (!fullQuiz) {
        setSubmitError(t('errors.quizConfigurationNotFound'));
        return;
      }

      dispatch(
        startSession({
          quizId: fullQuiz.id,
          questions: fullQuiz.questions,
          estimatedMinutes: fullQuiz.estimatedTime,
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        py: { xs: 2, md: 4 },
        px: { xs: 2, md: 3 },
      }}
    >
      <Container maxWidth="lg">
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
                    <QuizOverviewCard quiz={quiz} />
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
                          formValues={formValues}
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
  formValues: CandidateFormValues;
  isLoading?: boolean;
}

function CandidateFormFields({
  fieldsConfig,
  formValues,
  isLoading,
}: CandidateFormFieldsProps) {
  const { fields, sections } = fieldsConfig;
  const { t } = useTranslation();
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<CandidateFormValues>();

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
