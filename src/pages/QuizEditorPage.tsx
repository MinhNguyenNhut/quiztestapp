import { Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import QuestionBuilder from '../components/question-builder/QuestionBuilder';
import type { QuizFormValues } from '../types';
import type { RootState } from '../features/quiz/store.ts';
import { quizToFormValues, formValuesToQuiz } from '../utils/quizMappers.ts';
import { addQuiz, updateQuiz } from '../features/quiz/quizSlice.ts';
import { v4 as uuidv4 } from 'uuid';

export default function QuizEditorPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
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

    // 🔥 simulate validation failure example (remove later)
    // throw new Error("Backend rejected quiz");
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)' }}>
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
    </Box>
  );
}
