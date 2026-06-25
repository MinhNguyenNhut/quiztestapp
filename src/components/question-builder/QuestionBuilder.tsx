import { useState, useCallback, useEffect } from 'react';
import { useForm, FormProvider, useFieldArray, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Button } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import type { QuizFormValues, QuestionType, Difficulty, Quiz, QuestionFormValues, Question } from '../../types/index.ts';
import { quizFormSchema } from '../../utils/validation.ts';
import AddQuestionModal from './AddQuestionModal.tsx';
import QuestionList from './QuestionList.tsx';
import QuestionEditor from './QuestionEditor.tsx';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addQuiz } from '../../features/quiz/quizSlice.ts';
import { useAlert } from '../../hooks/useAlert.ts';
import AppAlert from '../common/AppAlert/AppAlert.tsx';

const INITIAL_QUESTION_TEMPLATE: QuizFormValues = {
  title: '',
  description: '',
  questions: [],
};

export default function QuestionBuilder() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const { alert, showAlert, closeAlert } = useAlert();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const methods = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema) as Resolver<QuizFormValues>,
    defaultValues: INITIAL_QUESTION_TEMPLATE,
    mode: 'onChange',
  });

  const { control, watch, setValue, getValues, formState: { errors } } = methods;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'questions',
  });

  const onSubmit = (data: QuizFormValues) => {
    const mapQuestionToQuestion = (
      question: QuestionFormValues,
      index: number
    ): Question => ({
      ...question,

      id: question.id ?? uuidv4(),
      order: index,

      options: question.options.map((option, optionIndex) => ({
        ...option,
        id: option.id ?? uuidv4(),
        order: option.order ?? optionIndex,
      })),

      childQuestions: question.childQuestions?.map((child, childIndex) =>
        mapQuestionToQuestion(child, childIndex)
      ),
    });

    const quiz: Quiz = {
      id: uuidv4(),
      title: data.title,
      description: data.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      questions: data.questions.map(mapQuestionToQuestion),
    };

    dispatch(addQuiz(quiz));

    navigate('/');
  };

  const handleSaveQuiz = methods.handleSubmit(
    (data) => {
      showAlert('Quiz saved successfully!', 'success');
      onSubmit(data);
    },
    (errors) => {
      showAlert(
        errors.title?.message || 'Please fix validation errors.',
        'error'
      );
    }
  );

  // Auto-select first question when list changes to non-empty
  useEffect(() => {
    if (fields.length > 0 && selectedIndex === null) {
      setSelectedIndex(0);
    } else if (fields.length === 0) {
      setSelectedIndex(null);
    }
  }, [fields.length, selectedIndex]);

  const handleAddQuestion = useCallback(
    (type: QuestionType) => {
      let options: { text: string; isCorrect: boolean; order: number }[];
      switch (type) {
        case 'single_choice':
          options = [
            { text: '', isCorrect: true, order: 0 },
            { text: '', isCorrect: false, order: 1 },
          ];
          break;
        case 'multiple_choice':
          options = [
            { text: '', isCorrect: false, order: 0 },
            { text: '', isCorrect: false, order: 1 },
          ];
          break;
        case 'true_false':
          options = [
            { text: 'True', isCorrect: true, order: 0 },
            { text: 'False', isCorrect: false, order: 1 },
          ];
          break;
        case 'fill_in_blank':
          options = [{ text: '', isCorrect: false, order: 0 }];
          break;
        case 'matching':
          options = [
            { text: '', isCorrect: false, order: 0 },
            { text: '', isCorrect: false, order: 1 },
          ];
          break;
        case 'reading_comprehension':
          options = [
            { text: '', isCorrect: false, order: 0 },
            { text: '', isCorrect: false, order: 1 },
          ];
          break;
        case 'short_answer':
          options = [{ text: '', isCorrect: false, order: 0 }];
          break;
        case 'essay':
          options = [{ text: '', isCorrect: false, order: 0 }];
          break;
        default:
          options = [
            { text: '', isCorrect: true, order: 0 },
            { text: '', isCorrect: false, order: 1 },
          ];
      }

      const newQuestion = {
        id: uuidv4(),
        type,
        title: '',
        content: { html: '', text: '' } as const,
        description: '',
        points: 1,
        difficulty: 'medium' as Difficulty,
        topic: '',
        tags: [],
        estimatedTime: undefined,
        options,
        explanation: { html: '', text: '' } as const,
        blanks: type === 'fill_in_blank' ? [] : undefined,
        matchingPairs: type === 'matching' ? [] : undefined,
        passage: type === 'reading_comprehension' ? { html: '', text: '' } : undefined,
        childQuestions: type === 'reading_comprehension' ? [] : undefined,
        expectedAnswer: type === 'short_answer' ? '' : undefined,
        caseSensitive: type === 'short_answer' ? false : undefined,
        rubric: type === 'essay' ? { html: '', text: '' } : undefined,
        scoringGuide: type === 'essay' ? '' : undefined,
      };

      append(newQuestion);
      // Auto-select the newly added question
      setSelectedIndex(fields.length);
    },
    [append, fields.length],
  );

  const handleSelectQuestion = useCallback(
    (index: number) => {
      setSelectedIndex(index);
    },
    [],
  );

  const handleDuplicate = useCallback(
    (index: number) => {
      const question = getValues(`questions.${index}`);
      if (question) {
        const cloned = { ...question, id: uuidv4() };
        const newIndex = index + 1;
        // Insert after the current question
        const allQuestions = getValues('questions');
        const updated = [...allQuestions.slice(0, newIndex), cloned, ...allQuestions.slice(newIndex)];
        setValue('questions', updated, { shouldValidate: true });
        setSelectedIndex(newIndex);
      }
    },
    [getValues, setValue],
  );

  const handleDelete = useCallback(
    (index: number) => {
      remove(index);
      if (selectedIndex === index) {
        const remaining = fields.length - 1;
        if (remaining > 0) {
          setSelectedIndex(Math.min(index, remaining - 1));
        } else {
          setSelectedIndex(null);
        }
      } else if (selectedIndex !== null && selectedIndex > index) {
        setSelectedIndex(selectedIndex - 1);
      }
    },
    [remove, selectedIndex, fields.length],
  );

  const handleReorder = useCallback(
    (from: number, to: number) => {
      move(from, to);
      if (selectedIndex === from) {
        setSelectedIndex(to);
      } else if (selectedIndex === to) {
        setSelectedIndex(from);
      }
    },
    [move, selectedIndex],
  );

  const selectedQuestion = selectedIndex !== null ? fields[selectedIndex] : null;

  return (
    <FormProvider {...methods}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Panel */}
          <QuestionList
            questions={fields}
            selectedIndex={selectedIndex}
            onSelect={handleSelectQuestion}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onReorder={handleReorder}
            onAddQuestion={() => setModalOpen(true)}
            onSaveQuiz={handleSaveQuiz}
            quizTitle={watch('title')}
            onQuizTitleChange={(value) => setValue('title', value, { shouldValidate: true })}
          />

          {/* Right Panel */}
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {selectedQuestion ? (
              <QuestionEditor
                control={control}
                errors={errors}
                watch={watch}
                setValue={setValue}
                getValues={getValues}
                questionType={selectedQuestion.type}
                index={selectedIndex!}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'text.disabled',
                  textAlign: 'center',
                  p: 4,
                }}
              >
                <Typography variant="h3" sx={{ mb: 2, opacity: 0.2 }}>
                  ?
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  No question selected
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
                  Select a question from the list or add a new one
                </Typography>
                <Button variant="contained" onClick={() => setModalOpen(true)}>
                  Add Question
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <AddQuestionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleAddQuestion}
      />

      <AppAlert
        open={alert.open}
        message={alert.message}
        severity={alert.severity}
        onClose={closeAlert}
      />
    </FormProvider>
  );
}
