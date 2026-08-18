/**
 * Question-related thunks.
 *
 * These live in their own feature module (rather than inside quizSlice)
 * because they cross-cut two slices: successful reorder/replace
 * operations are mirrored into `state.quiz` by quizSlice's extraReducers,
 * and question CRUD is otherwise stateless from the Redux point of view
 * (the canonical store is the backend; we fetch on demand).
 *
 * The dispatched question-only operations (create/update/delete) return
 * the affected Question so the calling page can splice it into local
 * form state.
 */
import { createAsyncThunk } from '@reduxjs/toolkit';
import type { Question } from '../../types/quiz';
import { questionApi, type CreateQuestionPayload, type UpdateQuestionPayload } from '../../api/questionApi.ts';

const rejectMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

/** POST /api/quizzes/:quizId/questions */
export const createQuestion = createAsyncThunk<
  { quizId: string; question: Question },
  { quizId: string; payload: CreateQuestionPayload },
  { rejectValue: string }
>('questions/create', async ({ quizId, payload }, { rejectWithValue }) => {
  try {
    const question = await questionApi.create(quizId, payload);
    return { quizId, question };
  } catch (err) {
    return rejectWithValue(rejectMessage(err, 'Failed to create question'));
  }
});

/** GET /api/quizzes/:quizId/questions */
export const fetchQuestionsForQuiz = createAsyncThunk<
  {
    quizId: string;
    questions: Question[];
  },
  string,
  {
    rejectValue: string;
  }
>(
  'questions/fetchQuestionsForQuiz',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `/api/quizzes/${quizId}/questions`
      );

      if (!response.ok) {
        const text = await response.text();

        throw new Error(
          `Failed to load questions (${response.status}): ${text.slice(0, 200)}`
        );
      }

      const contentType = response.headers.get('content-type');

      if (!contentType?.includes('application/json')) {
        const text = await response.text();

        throw new Error(
          `Expected JSON but received ${contentType ?? 'unknown content type'}: ${text.slice(0, 200)}`
        );
      }

      const data = await response.json();

      return {
        quizId,
        questions: data.data ?? data,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : 'Failed to load questions'
      );
    }
  }
);

/** PATCH /api/questions/:id */
export const updateQuestion = createAsyncThunk<
  Question,
  { id: string; patch: UpdateQuestionPayload },
  { rejectValue: string }
>(
  'questions/update',
  async ({ id, patch }, { rejectWithValue }) => {
    try {
      console.log('=== UPDATE QUESTION ===');
      console.log('Question ID:', id);
      console.log('PATCH:', patch);

      const result = await questionApi.update(id, patch);

      console.log('UPDATED QUESTION:', result);

      return result;
    } catch (err) {
      console.error('UPDATE QUESTION ERROR:', err);

      return rejectWithValue(
        rejectMessage(
          err,
          'Failed to update question'
        )
      );
    }
  },
);

/** DELETE /api/questions/:id — resolves with the deleted id. */
export const deleteQuestion = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>('questions/delete', async (id, { rejectWithValue }) => {
  try {
    await questionApi.remove(id);
    return id;
  } catch (err) {
    return rejectWithValue(rejectMessage(err, 'Failed to delete question'));
  }
});

/** PATCH /api/quizzes/:quizId/questions/reorder */
export const reorderQuestions = createAsyncThunk<
  { quizId: string; questions: Question[] },
  { quizId: string; questionIds: string[] },
  { rejectValue: string }
>('questions/reorder', async ({ quizId, questionIds }, { rejectWithValue }) => {
  try {
    const questions = await questionApi.reorder(quizId, questionIds);
    return { quizId, questions };
  } catch (err) {
    return rejectWithValue(rejectMessage(err, 'Failed to reorder questions'));
  }
});
