import { Alert, Box, Tabs, Tab, CircularProgress } from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useParams } from 'react-router-dom';

import QuestionBuilder from '../components/question-builder/QuestionBuilder';
import { CandidateFieldsBuilder } from '../components/candidate-fields-builder';
import QuizSettingsBuilder, { DEFAULT_QUIZ_SETTINGS } from '../components/quiz-settings-builder';

import type { Question, QuestionFormValues, QuizFormValues, QuestionType, RichTextContent } from '../types';
import type { RootState } from '../features/store.ts';

import { quizToFormValues } from '../utils/quizMappers.ts';

import {
  createQuiz,
  fetchQuizById,
  updateQuiz,
} from '../features/quiz/quizSlice.ts';

import { useAppDispatch, useAppSelector } from '../features/store.ts';
import { getUserProfile } from '../features/user/userSlice';
import { v4 as uuidv4 } from 'uuid';

import { getDefaultCandidateFieldsConfig } from '../shared/constants/defaultCandidateFields.ts';
import type { CandidateFieldsConfig } from '../types/candidate.ts';

import { fetchQuestionsForQuiz } from '../features/questions/questionThunks.ts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({
  children,
  value,
  index,
  ...other
}: TabPanelProps) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
      sx={{
        display: value === index ? 'flex' : 'none',
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* Keep children mounted to prevent form re-initialization lag */}
      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </Box>
    </Box>
  );
}

const EMPTY_QUESTIONS: Question[] = [];

export default function QuizEditorPage() {
  const { id } = useParams();
  return <QuizEditorContent key={id ?? 'new-quiz'} id={id} />;
}

function QuizEditorContent({ id }: { id: string | undefined }) {
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const aiDraft = readAiDraft(location.state);
  const [draftCandidateConfig, setDraftCandidateConfig] = useState<CandidateFieldsConfig>(
    () => getDefaultCandidateFieldsConfig(i18n.language),
  );

  const [tabValue, setTabValue] = useState(0);

  const quiz = useAppSelector((state: RootState) =>
    state.quiz.quizzes.find((q) => q.id === id)
  );

  const questions = useAppSelector(
    (state: RootState) =>
      id
        ? state.questions.questionsByQuizId[id] ?? EMPTY_QUESTIONS
        : EMPTY_QUESTIONS
  );

  const questionsLoading = useAppSelector(
    (state: RootState) => state.questions.isLoading
  );

  const questionsError = useAppSelector(
    (state: RootState) => state.questions.error
  );

  const isLoading = useAppSelector(
    (state: RootState) => state.quiz.isLoading
  );

  const error = useAppSelector(
    (state: RootState) => state.quiz.error
  );

  // Get current user profile for createdBy field
  const userProfile = useAppSelector(getUserProfile);

  useEffect(() => {
    if (id && !quiz) {
      void dispatch(fetchQuizById(id));
    }
  }, [dispatch, id, quiz]);

  useEffect(() => {
    if (id) {
      void dispatch(fetchQuestionsForQuiz(id));
    }
  }, [dispatch, id]);

  const quizWithQuestions = useMemo(() => {
    return quiz ? { ...quiz, questions } : null;
  }, [quiz, questions]);

  const defaultFormValues = useMemo(() => {
    return quizWithQuestions ? quizToFormValues(quizWithQuestions) : null;
  }, [quizWithQuestions]);

  const handleSave = useCallback(async (data: QuizFormValues) => {
    if (id && quiz) {
      const result = await dispatch(
        updateQuiz({
          id: quiz.id,
          patch: {
            title: data.title,
            description: data.description,
            estimatedTime: data.estimatedTime ?? 0,
            settings: data.settings ?? DEFAULT_QUIZ_SETTINGS,
          },
        })
      );

      if (updateQuiz.rejected.match(result)) {
        throw new Error(result.payload ?? 'Failed to update quiz');
      }
    } else {
      const result = await dispatch(
        createQuiz({
          title: data.title,
          description: data.description,
          estimatedTime: data.estimatedTime ?? 0,
          candidateFieldsConfig: draftCandidateConfig,
          settings: data.settings ?? DEFAULT_QUIZ_SETTINGS,
          createdBy: userProfile?.id
        })
      );

      if (createQuiz.rejected.match(result)) {
        throw new Error(result.payload ?? 'Failed to create quiz');
      }
    }
  }, [dispatch, id, quiz, userProfile, draftCandidateConfig]);

  const defaultCandidateConfig = useMemo(() => getDefaultCandidateFieldsConfig(i18n.language), [i18n.language]);
  const handleSaveDraftCandidateConfig = useCallback((config: CandidateFieldsConfig) => {
    setDraftCandidateConfig(config);
  }, []);
  const candidateConfig = useMemo(() => {
    if (!quiz) return draftCandidateConfig;
    const savedConfig = quiz.candidateFieldsConfig;
    return savedConfig && Array.isArray(savedConfig.fields)
      ? savedConfig
      : defaultCandidateConfig;
  }, [quiz, defaultCandidateConfig, draftCandidateConfig]);

  if (id && !quiz && isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (id && !quiz && error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (id && !quiz) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  const quizId = id ?? uuidv4();

  if (id && quiz && questionsLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (id && quiz && questionsError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{questionsError}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label={t('quizEditor.tabQuestions')} id="tab-0" aria-controls="tabpanel-0" />
        <Tab label={t('quizEditor.tabCandidateFields')} id="tab-1" aria-controls="tabpanel-1" />
        <Tab label={t('quizEditor.tabSettings')} id="tab-2" aria-controls="tabpanel-2" />
      </Tabs>

      <Box sx={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <TabPanel value={tabValue} index={0}>
          {id && quizWithQuestions && defaultFormValues ? (
            <QuestionBuilder
              mode="edit"
              originalQuiz={quizWithQuestions}
              defaultValues={defaultFormValues}
              onSave={handleSave}
            />
          ) : (
            <QuestionBuilder
              mode="create"
              createdBy={userProfile?.id}
              defaultValues={aiDraft}
              onSave={handleSave}
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {quiz ? (
            <CandidateFieldsBuilder
              quizId={quiz.id}
              defaultConfig={candidateConfig}
            />
          ) : (
            <CandidateFieldsBuilder
              quizId={quizId}
              defaultConfig={candidateConfig}
              onSave={handleSaveDraftCandidateConfig}
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {quiz ? (
            <QuizSettingsBuilder
              quizId={quiz.id}
              defaultSettings={quiz.settings ?? DEFAULT_QUIZ_SETTINGS}
              estimatedTime={quiz.estimatedTime}
            />
          ) : (
            <QuizSettingsBuilder
              quizId={quizId}
              defaultSettings={DEFAULT_QUIZ_SETTINGS}
            />
          )}
        </TabPanel>
      </Box>
    </Box>
  );
}

const QUESTION_TYPE_VALUES: QuestionType[] = [
  'single_choice',
  'multiple_choice',
  'true_false',
  'fill_in_blank',
  'matching',
  'reading_comprehension',
  'short_answer',
  'essay',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isRichText(value: unknown): value is RichTextContent {
  return isRecord(value) && typeof value.html === 'string' && typeof value.text === 'string';
}

function isQuestionFormValue(value: unknown): value is QuestionFormValues {
  if (!isRecord(value)) return false;
  return (
    typeof value.type === 'string' &&
    QUESTION_TYPE_VALUES.some((type) => type === value.type) &&
    typeof value.title === 'string' &&
    isRichText(value.content) &&
    typeof value.points === 'number' &&
    ['easy', 'medium', 'hard'].includes(String(value.difficulty)) &&
    Array.isArray(value.tags) &&
    value.tags.every((tag) => typeof tag === 'string') &&
    Array.isArray(value.options) &&
    value.options.every(
      (option) =>
        isRecord(option) &&
        typeof option.text === 'string' &&
        typeof option.isCorrect === 'boolean' &&
        (option.id === undefined || typeof option.id === 'string') &&
        (option.order === undefined || typeof option.order === 'number'),
    ) &&
    (value.id === undefined || typeof value.id === 'string') &&
    (value.description === undefined || typeof value.description === 'string') &&
    (value.expectedAnswer === undefined || typeof value.expectedAnswer === 'string') &&
    (value.caseSensitive === undefined || typeof value.caseSensitive === 'boolean') &&
    (value.scoringGuide === undefined || typeof value.scoringGuide === 'string') &&
    (value.blanks === undefined ||
      (Array.isArray(value.blanks) &&
        value.blanks.every(
          (blank) =>
            isRecord(blank) &&
            typeof blank.id === 'string' &&
            typeof blank.label === 'string' &&
            (blank.correctAnswer === undefined || typeof blank.correctAnswer === 'string'),
        ))) &&
    (value.matchingPairs === undefined ||
      (Array.isArray(value.matchingPairs) &&
        value.matchingPairs.every(
          (pair) =>
            isRecord(pair) &&
            typeof pair.id === 'string' &&
            typeof pair.left === 'string' &&
            typeof pair.right === 'string',
        ))) &&
    (value.childQuestions === undefined ||
      (Array.isArray(value.childQuestions) && value.childQuestions.every(isQuestionFormValue))) &&
    (value.explanation === undefined || isRichText(value.explanation)) &&
    (value.passage === undefined || isRichText(value.passage)) &&
    (value.rubric === undefined || isRichText(value.rubric))
  );
}

function isQuizFormValue(value: unknown): value is QuizFormValues {
  return (
    isRecord(value) &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    (value.estimatedTime === undefined || typeof value.estimatedTime === 'number') &&
    Array.isArray(value.questions) &&
    value.questions.every(isQuestionFormValue)
  );
}

function readAiDraft(state: unknown): QuizFormValues | undefined {
  if (!isRecord(state) || !isQuizFormValue(state.aiDraft)) return undefined;
  return state.aiDraft;
}