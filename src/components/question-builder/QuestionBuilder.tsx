import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useForm, FormProvider, useFieldArray, useWatch, type Resolver, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import type { QuizFormValues, QuestionType, Quiz, QuestionFormValues } from '../../types/index.ts';
import { createQuestionTemplate } from '../../utils/quizMappers.ts';
import { createQuestionSchemas } from '../../utils/validation.ts';
import AddQuestionModal from './AddQuestionModal.tsx';
import QuestionList from './QuestionList.tsx';
import QuestionEditor from './QuestionEditor.tsx';
import { useNavigate } from 'react-router-dom';
import { createQuiz } from '../../features/quiz/quizSlice.ts';
import { createQuestion, deleteQuestion, updateQuestion } from '../../features/questions/questionThunks.ts';
import { useAlert } from '../../hooks/useAlert.ts';
import AppAlert from '../common/AppAlert/AppAlert.tsx';
import type { CreateQuestionPayload } from '../../api/questionApi.ts';
import { useAppDispatch } from '../../features/store.ts';

type QuestionBuilderProps =
  | { mode: 'create'; createdBy?: string; onSave: (data: QuizFormValues) => void | Promise<void>; onCancel?: () => void; onDirtyChange?: (isDirty: boolean) => void }
  | { mode: 'edit'; defaultValues: QuizFormValues; originalQuiz: Quiz; onSave: (data: QuizFormValues) => void | Promise<void>; onCancel?: () => void; onDirtyChange?: (isDirty: boolean) => void };

function getFirstErrorMessage(errors: unknown): string | undefined {
  if (!errors) return undefined;
  if (typeof errors === 'string') return errors;
  if (typeof errors === 'object' && errors !== null) {
    if ('message' in errors && typeof errors.message === 'string') return errors.message;
    for (const value of Object.values(errors)) {
      const message = getFirstErrorMessage(value);
      if (message) return message;
    }
  }
  return undefined;
}

const buildPayload = (question: QuestionFormValues, index: number): CreateQuestionPayload => ({
  type: question.type,
  title: question.title,
  content: question.content,
  description: question.description,
  difficulty: question.difficulty,
  explanation: question.explanation,
  points: question.points,
  order: index,
  options: (question.options ?? []).map((option, optionIndex) => ({
    id: option.id ?? uuidv4(),
    text: option.text ?? '',
    isCorrect: option.isCorrect ?? false,
    order: option.order ?? optionIndex,
  })),
  childQuestions: question.childQuestions,
});

export default function QuestionBuilder(props: QuestionBuilderProps) {
  const { onSave, onDirtyChange, mode } = props;

  const defaultValues = mode === 'edit' ? props.defaultValues : undefined;
  const originalQuiz = mode === 'edit' ? props.originalQuiz : undefined;
  const createdBy = mode === 'create' ? props.createdBy : undefined;

  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { alert, showAlert, closeAlert } = useAlert();

  const quizFormSchema = useMemo(() => createQuestionSchemas(t).createQuizFormSchema, [t]);

  const [initialValues] = useState<QuizFormValues>(() =>
    mode === 'edit' && defaultValues
      ? {
        ...defaultValues,
        questions: (defaultValues.questions ?? []).map((question) => ({
          ...question,
          options: (question.options ?? []).map((option, optionIndex) => ({
            ...option,
            id: option.id ?? uuidv4(),
            text: option.text ?? '',
            isCorrect: Boolean(option.isCorrect),
            order: option.order ?? optionIndex,
          })),
        })),
      }
      : { title: '', description: '', estimatedTime: 0, questions: [] },
  );

  const methods = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema) as Resolver<QuizFormValues>,
    defaultValues: initialValues,
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const { control, setValue, getValues, formState: { isDirty } } = methods;
  const { fields, append, remove, move } = useFieldArray({ control, name: 'questions' });

  // `fields` gets a new array reference on every keystroke anywhere in the
  // form, because Controller-based nested inputs require RHF to keep fields
  // in sync with live values. We don't want that churn to reach the sidebar,
  // which only needs to know the *count and order* of questions (ids), not
  // their live values (each row watches its own values via useWatch).
  // This useState-diff pattern gives us a value that only changes when the
  // ids or their order actually changes — i.e. on add/remove/duplicate/move.
  const [fieldIds, setFieldIds] = useState<string[]>(() => fields.map((f) => f.id));
  const latestIds = fields.map((f) => f.id);
  const idsChanged =
    latestIds.length !== fieldIds.length ||
    latestIds.some((id, i) => id !== fieldIds[i]);
  if (idsChanged) {
    setFieldIds(latestIds);
  }

  const quizTitle = useWatch({ control, name: 'title' });
  const estimatedTime = useWatch({ control, name: 'estimatedTime' });

  const prevDirtyRef = useRef(isDirty);
  useEffect(() => {
    if (isDirty !== prevDirtyRef.current) {
      prevDirtyRef.current = isDirty;
      onDirtyChange?.(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  const [prevFieldsLength, setPrevFieldsLength] = useState(fields.length);
  if (fields.length !== prevFieldsLength) {
    setPrevFieldsLength(fields.length);
    if (fields.length > 0 && selectedIndex === null) {
      setSelectedIndex(0);
    } else if (fields.length === 0) {
      setSelectedIndex(null);
    }
  }

  const submitToStore = useCallback(
    async (data: QuizFormValues) => {
      const quiz = await dispatch(
        createQuiz({
          title: data.title,
          description: data.description,
          estimatedTime: data.estimatedTime ?? 0,
          createdBy,
        }),
      ).unwrap();

      for (const [index, question] of data.questions.entries()) {
        await dispatch(createQuestion({ quizId: quiz.id, payload: buildPayload(question, index) })).unwrap();
      }
      navigate('/');
    },
    [dispatch, navigate, createdBy],
  );

  const updateQuestions = useCallback(
    async (quizId: string, questions: QuestionFormValues[]) => {
      if (mode !== 'edit' || !originalQuiz) return;
      const originalQuestions = originalQuiz.questions ?? [];
      const existingIds = new Set(originalQuestions.map((q) => q.id).filter(Boolean));
      const currentIds = new Set(questions.map((q) => q.id).filter(Boolean));

      for (const [index, question] of questions.entries()) {
        const payload = buildPayload(question, index);
        if (question.id && existingIds.has(question.id)) {
          await dispatch(updateQuestion({ id: question.id, patch: payload })).unwrap();
        } else {
          await dispatch(createQuestion({ quizId, payload })).unwrap();
        }
      }

      for (const original of originalQuestions) {
        if (original.id && !currentIds.has(original.id)) {
          await dispatch(deleteQuestion(original.id)).unwrap();
        }
      }
    },
    [dispatch, mode, originalQuiz],
  );

  const onValidSubmit = useCallback(
    async (data: QuizFormValues) => {
      setIsSaving(true);
      try {
        if (mode === 'create') {
          await submitToStore(data);
        } else {
          await onSave(data);
          if (originalQuiz) {
            await updateQuestions(originalQuiz.id, data.questions);
          }
        }
        showAlert(t('quizEditor.quizSaved'), 'success');
      } catch (err) {
        console.error('Save failed:', err);
        showAlert(err instanceof Error ? err.message : t('questionBuilder.saveFailed'), 'error');
      } finally {
        setIsSaving(false);
      }
    },
    [mode, submitToStore, onSave, updateQuestions, originalQuiz, showAlert, t],
  );

  const onInvalidSubmit = useCallback(
    (formErrors: FieldErrors<QuizFormValues>) => {
      console.error('Validation errors:', formErrors);
      showAlert(getFirstErrorMessage(formErrors) ?? t('questionBuilder.fixValidationErrors'), 'error');
    },
    [showAlert, t],
  );

  const handleSaveQuiz = useCallback(
    () => methods.handleSubmit(onValidSubmit, onInvalidSubmit)(),
    [methods, onValidSubmit, onInvalidSubmit],
  );

  const handleAddQuestion = useCallback(
    (type: QuestionType) => {
      append(createQuestionTemplate(type));
      setSelectedIndex(fields.length);
    },
    [append, fields.length],
  );

  const handleSelectQuestion = useCallback((index: number) => setSelectedIndex(index), []);

  const handleDuplicate = useCallback(
    (index: number) => {
      const question = getValues(`questions.${index}`);
      if (!question) return;
      const cloned = { ...question, id: uuidv4() };
      const newIndex = index + 1;
      const allQuestions = getValues('questions');
      const updated = [...allQuestions.slice(0, newIndex), cloned, ...allQuestions.slice(newIndex)];
      // Removed shouldValidate: true to prevent massive lag
      setValue('questions', updated, { shouldDirty: true });
      setSelectedIndex(newIndex);
    },
    [getValues, setValue],
  );

  const handleDelete = useCallback(
    (index: number) => {
      remove(index);
      if (selectedIndex === index) {
        const remaining = fields.length - 1;
        setSelectedIndex(remaining > 0 ? Math.min(index, remaining - 1) : null);
      } else if (selectedIndex !== null && selectedIndex > index) {
        setSelectedIndex(selectedIndex - 1);
      }
    },
    [remove, selectedIndex, fields.length],
  );

  const handleReorder = useCallback(
    (from: number, to: number) => {
      move(from, to);
      if (selectedIndex === from) setSelectedIndex(to);
      else if (selectedIndex === to) setSelectedIndex(from);
    },
    [move, selectedIndex],
  );

  // Removed shouldValidate: true so Zod doesn't run on every keystroke
  const handleQuizTitleChange = useCallback(
    (value: string) => setValue('title', value, { shouldDirty: true }),
    [setValue],
  );

  const handleEstimatedTimeChange = useCallback(
    (value: number | string) => setValue('estimatedTime', value ? Number(value) : 0, { shouldDirty: true }),
    [setValue],
  );

  const handleOpenModal = useCallback(() => setModalOpen(true), []);
  const handleCloseModal = useCallback(() => setModalOpen(false), []);

  const selectedQuestion = selectedIndex !== null ? fields[selectedIndex] : null;

  return (
    <FormProvider {...methods}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <QuestionList
            fieldIds={fieldIds}
            control={control}
            selectedIndex={selectedIndex}
            onSelect={handleSelectQuestion}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onReorder={handleReorder}
            onAddQuestion={handleOpenModal}
            onSaveQuiz={handleSaveQuiz}
            quizTitle={quizTitle}
            onQuizTitleChange={handleQuizTitleChange}
            estimatedTime={estimatedTime ?? 0}
            onEstimatedTimeChange={handleEstimatedTimeChange}
            isSaving={isSaving}
          />

          <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {selectedQuestion ? (
              <QuestionEditor
                control={control}
                setValue={setValue}
                getValues={getValues}
                questionType={selectedQuestion.type}
                index={selectedIndex!}
              />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.disabled', textAlign: 'center', p: 4 }}>
                <Typography variant="h3" sx={{ mb: 2, opacity: 0.2 }}>?</Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>{t('questionBuilder.noQuestionSelected')}</Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>{t('questionBuilder.selectQuestionHint')}</Typography>
                <Button variant="contained" onClick={handleOpenModal}>{t('questionBuilder.addQuestion')}</Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <AddQuestionModal open={modalOpen} onClose={handleCloseModal} onSelect={handleAddQuestion} />
      <AppAlert open={alert.open} message={alert.message} severity={alert.severity} onClose={closeAlert} />
    </FormProvider>
  );
}