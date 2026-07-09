import { Box, Tabs, Tab, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import QuestionBuilder from '../components/question-builder/QuestionBuilder';
import { CandidateFieldsBuilder } from '../components/candidate-fields-builder';
import { DEFAULT_CANDIDATE_FIELDS_CONFIG } from '../shared/constants/defaultCandidateFields';
import type { QuizFormValues } from '../types';
import type { RootState } from '../features/quiz/store.ts';
import { quizToFormValues, formValuesToQuiz } from '../utils/quizMappers.ts';
import { addQuiz, updateQuiz } from '../features/quiz/quizSlice.ts';
import { v4 as uuidv4 } from 'uuid';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

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

export default function QuizEditorPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);
  const quiz = useSelector((state: RootState) =>
    state.quiz.quizzes.find((q) => q.id === id)
  );

  const handleSave = async (data: QuizFormValues) => {
    const now = new Date().toISOString();

    if (id && quiz) {
      const updatedQuiz = formValuesToQuiz(data, {
        id: quiz.id,
        createdAt: quiz.createdAt,
        updatedAt: now,
      });

      dispatch(updateQuiz(updatedQuiz));
    } else {
      const newQuiz = formValuesToQuiz(data, {
        id: uuidv4(),
        createdAt: now,
        updatedAt: now,
      });

      dispatch(addQuiz(newQuiz));
    }
  };

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Questions" id="tab-0" aria-controls="tabpanel-0" />
        <Tab label="Candidate Fields" id="tab-1" aria-controls="tabpanel-1" />
      </Tabs>

      <Box sx={{ flex: 1, display: 'flex', minHeight: 0, }}>
        <TabPanel value={tabValue} index={0}>
          {id ? (
            quiz && (
              <QuestionBuilder
                mode="edit"
                originalQuiz={quiz}
                defaultValues={quizToFormValues(quiz)}
                onSave={handleSave}
              />
            )
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
              defaultConfig={quiz.candidateFieldsConfig ?? DEFAULT_CANDIDATE_FIELDS_CONFIG}
            />
          ) : (
            <CandidateFieldsBuilder
              quizId={quizId}
              defaultConfig={DEFAULT_CANDIDATE_FIELDS_CONFIG}
            />
          )}
        </TabPanel>
      </Box>
    </Box>
  );
}
