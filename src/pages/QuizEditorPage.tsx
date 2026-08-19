import { Alert, Box, Tabs, Tab, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import QuestionBuilder from '../components/question-builder/QuestionBuilder';
import { CandidateFieldsBuilder } from '../components/candidate-fields-builder';

import type { Question, QuizFormValues } from '../types';
import type { RootState } from '../features/store.ts';

import { quizToFormValues } from '../utils/quizMappers.ts';

import {
  createQuiz,
  fetchQuizById,
  updateQuiz,
} from '../features/quiz/quizSlice.ts';

import { useAppDispatch, useAppSelector } from '../features/store.ts';
import { v4 as uuidv4 } from 'uuid';

import { getDefaultCandidateFieldsConfig } from '../shared/constants/defaultCandidateFields.ts';

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
      <Box sx={{ flex: 1, minHeight: 0 }}>
        {children}
      </Box>
    </Box>
  );
}

const EMPTY_QUESTIONS: Question[] = [];

export default function QuizEditorPage() {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { t, i18n } = useTranslation();

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

  const quizWithQuestions = quiz
    ? {
      ...quiz,
      questions,
    }
    : null;


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

  const handleSave = async (data: QuizFormValues) => {
    if (id && quiz) {
      const result = await dispatch(
        updateQuiz({
          id: quiz.id,
          patch: {
            title: data.title,
            description: data.description,
            estimatedTime: data.estimatedTime ?? 0,
          },
        })
      );

      if (updateQuiz.rejected.match(result)) {
        throw new Error(
          result.payload ?? 'Failed to update quiz'
        );
      }
    } else {
      const result = await dispatch(
        createQuiz({
          title: data.title,
          description: data.description,
          estimatedTime: data.estimatedTime ?? 0
        })
      );

      if (createQuiz.rejected.match(result)) {
        throw new Error(
          result.payload ?? 'Failed to create quiz'
        );
      }
    }
  };

  if (id && !quiz && isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 64px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (id && !quiz && error) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          {error}
        </Alert>
      </Box>
    );
  }

  if (id && !quiz) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 64px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const quizId = id ?? uuidv4();

  if (id && quiz && questionsLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'calc(100vh - 64px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (id && quiz && questionsError) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          {questionsError}
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
      }}
    >
      <Tabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Tab
          label={t('quizEditor.tabQuestions')}
          id="tab-0"
          aria-controls="tabpanel-0"
        />

        <Tab
          label={t('quizEditor.tabCandidateFields')}
          id="tab-1"
          aria-controls="tabpanel-1"
        />
      </Tabs>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          minHeight: 0,
        }}
      >
        <TabPanel value={tabValue} index={0}>
          {id && quizWithQuestions ? (
            <QuestionBuilder
              mode="edit"
              originalQuiz={quizWithQuestions}
              defaultValues={quizToFormValues(quizWithQuestions)}
              onSave={handleSave}
            />
          ) : (
            <QuestionBuilder
              mode="create"
              onSave={handleSave}
            />
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {quiz ? (
            <CandidateFieldsBuilder
              quizId={quiz.id}
              defaultConfig={
                quiz.candidateFieldsConfig ??
                getDefaultCandidateFieldsConfig(i18n.language)
              }
            />
          ) : (
            <CandidateFieldsBuilder
              quizId={quizId}
              defaultConfig={getDefaultCandidateFieldsConfig(
                i18n.language
              )}
            />
          )}
        </TabPanel>
      </Box>
    </Box>
  );
}
