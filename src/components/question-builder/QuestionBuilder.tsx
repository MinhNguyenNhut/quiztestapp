import { useState, useCallback, useEffect, useRef } from 'react';
import { useForm, FormProvider, useFieldArray, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Button } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import type {
  QuizFormValues,
  QuestionType,
  Quiz,
  QuestionFormValues,
  Question,
} from '../../types/index.ts';
import { quizFormSchema } from '../../utils/validation.ts';
import { createQuestionTemplate } from '../../utils/quizMappers.ts';
import AddQuestionModal from './AddQuestionModal.tsx';
import QuestionList from './QuestionList.tsx';
import QuestionEditor from './QuestionEditor.tsx';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addQuiz } from '../../features/quiz/quizSlice.ts';
import { useAlert } from '../../hooks/useAlert.ts';
import AppAlert from '../common/AppAlert/AppAlert.tsx';

/**
 * QuestionBuilder is a reusable form for editing a quiz's question set.
 *
 * It is intentionally mode-agnostic: it owns the form, validation, and
 * selection state, but knows nothing about how the persisted quiz is
 * stored or where to navigate afterwards. The page supplies the mode
 * (`create` vs `edit`) and an `onSave` callback that decides what to do
 * with the validated values (dispatch + navigate, etc.).
 *
 * In `edit` mode the caller must provide `defaultValues` (already mapped
 * from a persisted `Quiz`) and `originalQuiz`. The component mounts only
 * once `defaultValues` is defined — see `QuizEditorPage`.
 */
type QuestionBuilderProps =
  | {
    mode: 'create';
    onSave: (data: QuizFormValues) => void | Promise<void>;
    onCancel?: () => void;
    onDirtyChange?: (isDirty: boolean) => void;
  }
  | {
    mode: 'edit';
    defaultValues: QuizFormValues;
    originalQuiz: Quiz;
    onSave: (data: QuizFormValues) => void | Promise<void>;
    onCancel?: () => void;
    onDirtyChange?: (isDirty: boolean) => void;
  };

export default function QuestionBuilder(props: QuestionBuilderProps) {
  const { onSave, onDirtyChange } = props;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { alert, showAlert, closeAlert } = useAlert();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const initialValues: QuizFormValues =
    props.mode === 'edit' ? props.defaultValues : { title: '', description: '', questions: [] };

  const methods = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema) as Resolver<QuizFormValues>,
    defaultValues: initialValues,
    mode: 'onChange',
  });

  const { control, watch, setValue, getValues, formState: { errors, isDirty } } = methods;

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'questions',
  });

  // Fire `onDirtyChange` only on transitions, not per keystroke.
  const prevDirtyRef = useRef(isDirty);
  useEffect(() => {
    if (isDirty !== prevDirtyRef.current) {
      prevDirtyRef.current = isDirty;
      onDirtyChange?.(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  const submitToStore = (data: QuizFormValues) => {
    const difficulties = data.questions.map((q) => q.difficulty);

    const difficulty = difficulties.includes('hard') ? 'hard' : difficulties.includes('medium') ? 'medium' : 'easy';
    // In step 2 the dispatch lives in the builder. Step 3 moves it to the page.
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
      difficulty: difficulty
    };

    dispatch(addQuiz(quiz));
    navigate('/');
  };

  const handleSaveQuiz = methods.handleSubmit(async (data) => {
    setIsSaving(true);

    try {
      if (props.mode === 'create') {
        submitToStore(data);
      } else {
        await onSave?.(data);
      }

      showAlert('Quiz saved successfully!', 'success');
    } catch (err) {
      showAlert(err instanceof Error ? err.message : 'Save failed', 'error');
    } finally {
      setIsSaving(false);
    }
  },
    (errors) => {
      const message = getFirstErrorMessage(errors);

      showAlert(
        message ?? 'Please fix validation errors',
        'error'
      );
    }
  );
  function getFirstErrorMessage(errors: any): string | undefined {
    if (!errors) return undefined;

    // string or direct message
    if (typeof errors === 'string') return errors;

    // RHF field error
    if (typeof errors === 'object') {
      if ('message' in errors && typeof errors.message === 'string') {
        return errors.message;
      }

      // nested object → search first value
      for (const value of Object.values(errors)) {
        const msg = getFirstErrorMessage(value);
        if (msg) return msg;
      }
    }

    return undefined;
  }

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
      const template = createQuestionTemplate(type);
      append(template);
      setSelectedIndex(fields.length);
    },
    [append, fields.length]
  );

  const handleSelectQuestion = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleDuplicate = useCallback(
    (index: number) => {
      const question = getValues(`questions.${index}`);
      if (question) {
        const cloned = { ...question, id: uuidv4() };
        const newIndex = index + 1;
        const allQuestions = getValues('questions');
        const updated = [
          ...allQuestions.slice(0, newIndex),
          cloned,
          ...allQuestions.slice(newIndex),
        ];
        setValue('questions', updated, { shouldValidate: true });
        setSelectedIndex(newIndex);
      }
    },
    [getValues, setValue]
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
    [remove, selectedIndex, fields.length]
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
    [move, selectedIndex]
  );

  const selectedQuestion = selectedIndex !== null ? fields[selectedIndex] : null;

  return (
    <FormProvider {...methods}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
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
            isSaving={isSaving}
          />

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
