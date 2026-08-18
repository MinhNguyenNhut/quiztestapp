import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useForm, FormProvider, useFieldArray, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import type {
  QuizFormValues,
  QuestionType,
  Quiz,
  QuestionFormValues,
  Question,
} from '../../types/index.ts';
import { createQuestionTemplate } from '../../utils/quizMappers.ts';
import { createQuestionSchemas } from '../../utils/validation.ts';
import AddQuestionModal from './AddQuestionModal.tsx';
import QuestionList from './QuestionList.tsx';
import QuestionEditor from './QuestionEditor.tsx';
import { useNavigate } from 'react-router-dom';
import {
  createQuiz,
  updateQuiz,
} from '../../features/quiz/quizSlice.ts';
import {
  createQuestion,
  deleteQuestion,
  updateQuestion,
} from '../../features/questions/questionThunks.ts';
import { useAlert } from '../../hooks/useAlert.ts';
import AppAlert from '../common/AppAlert/AppAlert.tsx';
import type { CreateQuestionPayload } from '../../api/questionApi.ts';
import { useAppDispatch } from '../../features/store.ts';

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

export default function QuestionBuilder(
  props: QuestionBuilderProps,
) {
  const { onSave, onDirtyChange } = props;

  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [selectedIndex, setSelectedIndex] =
    useState<number | null>(null);

  const [modalOpen, setModalOpen] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const { alert, showAlert, closeAlert } = useAlert();

  /**
   * Create the translated Zod schema.
   *
   * The schema is recreated when the translation function changes,
   * which normally happens when the application language changes.
   */
  const quizFormSchema = useMemo(
    () => createQuestionSchemas(t).createQuizFormSchema,
    [t],
  );

  /**
   * Initial form values.
   */
  const initialValues: QuizFormValues =
    props.mode === 'edit'
      ? {
        ...props.defaultValues,

        questions: (props.defaultValues.questions ?? []).map(
          (question) => ({
            ...question,

            options: (question.options ?? []).map(
              (option, optionIndex) => ({
                ...option,
                id: option.id ?? uuidv4(),
                text: option.text ?? '',
                isCorrect: Boolean(option.isCorrect),
                order: option.order ?? optionIndex,
              }),
            ),
          }),
        ),
      }
      : {
        title: '',
        description: '',
        questions: [],
      };

  /**
   * React Hook Form.
   */
  const methods = useForm<QuizFormValues>({
    resolver: zodResolver(
      quizFormSchema,
    ) as Resolver<QuizFormValues>,
    defaultValues: initialValues,
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  const {
    control,
    watch,
    setValue,
    getValues,
    formState: {
      errors,
      isDirty,
    },
  } = methods;

  /**
   * Question field array.
   */
  const {
    fields,
    append,
    remove,
    move,
  } = useFieldArray({
    control,
    name: 'questions',
  });

  /**
   * Notify parent when dirty state changes.
   */
  const prevDirtyRef = useRef(isDirty);

  useEffect(() => {
    if (isDirty !== prevDirtyRef.current) {
      prevDirtyRef.current = isDirty;

      onDirtyChange?.(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  /**
   * Create quiz and save it to Redux.
   */
  const submitToStore = async (data: QuizFormValues) => {
    // 1. Create the quiz first
    const quiz = await dispatch(
      createQuiz({
        title: data.title,
        description: data.description,
      }),
    ).unwrap();

    console.log('Quiz created:', quiz);

    // 2. Create all questions using the newly-created quiz ID
    for (const [index, question] of data.questions.entries()) {
      const payload: CreateQuestionPayload = {
        type: question.type,
        title: question.title,
        content: question.content,
        description: question.description,
        difficulty: question.difficulty,
        points: question.points,
        order: index,

        options: question.options.map(
          (option, optionIndex) => ({
            id: option.id ?? uuidv4(),
            text: option.text,
            isCorrect: option.isCorrect ?? false,
            order: option.order ?? optionIndex,
          }),
        ),

        childQuestions: question.childQuestions,
      };

      console.log('Question difficulty:', question.difficulty);
      console.log('Question payload:', payload);

      await dispatch(
        createQuestion({
          quizId: quiz.id,
          payload,
        }),
      ).unwrap();
    }

    console.log('Quiz and questions saved successfully');

    navigate('/');
  };

  /**
   * Save quiz.
   */
  const handleSaveQuiz = methods.handleSubmit(
    async (data) => {
      setIsSaving(true);

      try {
        if (props.mode === 'create') {
          await submitToStore(data);
        } else {
          // 1. Update quiz title/description
          await onSave(data);

          // 2. Update existing questions
          await updateQuestions(
            props.originalQuiz.id,
            data.questions,
          );
        }

        showAlert(
          t('quizEditor.quizSaved'),
          'success',
        );
      } catch (err) {
        console.error('Save failed:', err);

        showAlert(
          err instanceof Error
            ? err.message
            : t('questionBuilder.saveFailed'),
          'error',
        );
      } finally {
        setIsSaving(false);
      }
    },

    (errors) => {
      console.error('Validation errors:', errors);

      const message = getFirstErrorMessage(errors);

      showAlert(
        message ??
        t('questionBuilder.fixValidationErrors'),
        'error',
      );
    },
  );

  /**
   * Get the first validation error recursively.
   */
  function getFirstErrorMessage(
    errors: unknown,
  ): string | undefined {
    if (!errors) {
      return undefined;
    }

    if (typeof errors === 'string') {
      return errors;
    }

    if (
      typeof errors === 'object' &&
      errors !== null
    ) {
      if (
        'message' in errors &&
        typeof errors.message === 'string'
      ) {
        return errors.message;
      }

      for (
        const value of Object.values(errors)
      ) {
        const message =
          getFirstErrorMessage(value);

        if (message) {
          return message;
        }
      }
    }

    return undefined;
  }

  /**
   * Automatically select the first question.
   */
  useEffect(() => {
    if (
      fields.length > 0 &&
      selectedIndex === null
    ) {
      setSelectedIndex(0);
    } else if (
      fields.length === 0
    ) {
      setSelectedIndex(null);
    }
  }, [fields.length, selectedIndex]);

  /**
   * Add question.
   */
  const handleAddQuestion = useCallback(
    (type: QuestionType) => {
      const template =
        createQuestionTemplate(type);

      append(template);

      setSelectedIndex(fields.length);
    },
    [append, fields.length],
  );

  /**
   * Select question.
   */
  const handleSelectQuestion =
    useCallback((index: number) => {
      setSelectedIndex(index);
    }, []);

  /**
   * Duplicate question.
   */
  const handleDuplicate = useCallback(
    (index: number) => {
      const question =
        getValues(`questions.${index}`);

      if (!question) {
        return;
      }

      const cloned = {
        ...question,
        id: uuidv4(),
      };

      const newIndex = index + 1;

      const allQuestions =
        getValues('questions');

      const updated = [
        ...allQuestions.slice(
          0,
          newIndex,
        ),

        cloned,

        ...allQuestions.slice(newIndex),
      ];

      setValue(
        'questions',
        updated,
        {
          shouldValidate: true,
          shouldDirty: true,
        },
      );

      setSelectedIndex(newIndex);
    },
    [getValues, setValue],
  );

  /**
   * Delete question.
   */
  const handleDelete = useCallback(
    (index: number) => {
      remove(index);

      if (selectedIndex === index) {
        const remaining =
          fields.length - 1;

        if (remaining > 0) {
          setSelectedIndex(
            Math.min(
              index,
              remaining - 1,
            ),
          );
        } else {
          setSelectedIndex(null);
        }
      } else if (
        selectedIndex !== null &&
        selectedIndex > index
      ) {
        setSelectedIndex(
          selectedIndex - 1,
        );
      }
    },
    [
      remove,
      selectedIndex,
      fields.length,
    ],
  );

  /**
   * Reorder questions.
   */
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

  const updateQuestions = async (
    quizId: string,
    questions: QuestionFormValues[],
  ) => {
    if (props.mode !== 'edit') {
      return;
    }

    const originalQuestions = props.originalQuiz.questions ?? [];

    // IDs that actually exist in MongoDB
    const existingQuestionIds = new Set(
      originalQuestions
        .map((question) => question.id)
        .filter(Boolean),
    );

    // IDs currently present in the form
    const currentQuestionIds = new Set(
      questions
        .map((question) => question.id)
        .filter(Boolean),
    );

    // -----------------------------------------
    // 1. CREATE new questions
    // -----------------------------------------
    for (const [index, question] of questions.entries()) {
      const payload: CreateQuestionPayload = {
        type: question.type,
        title: question.title,
        content: question.content,
        description: question.description,
        difficulty: question.difficulty,
        points: question.points,
        order: index,

        options: (question.options ?? []).map(
          (option, optionIndex) => ({
            id: option.id ?? uuidv4(),
            text: option.text ?? '',
            isCorrect: option.isCorrect ?? false,
            order: option.order ?? optionIndex,
          }),
        ),

        childQuestions: question.childQuestions,
      };

      // Existing question → UPDATE
      if (question.id && existingQuestionIds.has(question.id)) {
        console.log('Updating existing question:', question.id);
        console.log('Payload:', payload);

        await dispatch(
          updateQuestion({
            id: question.id,
            patch: payload,
          }),
        ).unwrap();

        continue;
      }

      // New question → CREATE
      console.log('Creating new question:', question.id);

      await dispatch(
        createQuestion({
          quizId,
          payload,
        }),
      ).unwrap();
    }

    // -----------------------------------------
    // 2. DELETE questions removed from the form
    // -----------------------------------------
    for (const originalQuestion of originalQuestions) {
      const questionId = originalQuestion.id;

      if (
        questionId &&
        !currentQuestionIds.has(questionId)
      ) {
        console.log('Deleting question:', questionId);

        await dispatch(
          deleteQuestion(questionId),
        ).unwrap();
      }
    }
  };

  /**
   * Currently selected question.
   */
  const selectedQuestion =
    selectedIndex !== null
      ? fields[selectedIndex]
      : null;

  return (
    <FormProvider {...methods}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flex: 1,
            overflow: 'hidden',
          }}
        >
          {/* Question list */}
          <QuestionList
            questions={fields}
            selectedIndex={selectedIndex}
            onSelect={handleSelectQuestion}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            onReorder={handleReorder}
            onAddQuestion={() =>
              setModalOpen(true)
            }
            onSaveQuiz={handleSaveQuiz}
            quizTitle={watch('title')}
            onQuizTitleChange={(value) =>
              setValue(
                'title',
                value,
                {
                  shouldValidate: true,
                  shouldDirty: true,
                },
              )
            }
            isSaving={isSaving}
          />

          {/* Question editor */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {selectedQuestion ? (
              <QuestionEditor
                control={control}
                errors={errors}
                watch={watch}
                setValue={setValue}
                getValues={getValues}
                questionType={
                  selectedQuestion.type
                }
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
                <Typography
                  variant="h3"
                  sx={{
                    mb: 2,
                    opacity: 0.2,
                  }}
                >
                  ?
                </Typography>

                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  {t(
                    'questionBuilder.noQuestionSelected',
                  )}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.disabled"
                  sx={{ mb: 3 }}
                >
                  {t(
                    'questionBuilder.selectQuestionHint',
                  )}
                </Typography>

                <Button
                  variant="contained"
                  onClick={() =>
                    setModalOpen(true)
                  }
                >
                  {t(
                    'questionBuilder.addQuestion',
                  )}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      {/* Add question modal */}
      <AddQuestionModal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        onSelect={handleAddQuestion}
      />

      {/* Alert */}
      <AppAlert
        open={alert.open}
        message={alert.message}
        severity={alert.severity}
        onClose={closeAlert}
      />
    </FormProvider>
  );
}
