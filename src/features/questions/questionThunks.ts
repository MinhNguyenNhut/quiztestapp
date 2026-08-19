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
import { apiGet } from '../../api/httpClient.ts';

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
export const fetchQuestionsForQuiz = createAsyncThunk<{ quizId: string; questions: Question[]; }, string, { rejectValue: string; }>(
  'questions/fetchQuestionsForQuiz',
  async (quizId, { rejectWithValue }) => {
    try {
      const response = await apiGet<{ data: Question[] } | Question[]>(
        `/api/quizzes/${quizId}/questions`
      );

      const questions = Array.isArray(response) ? response : response.data;
      return { quizId, questions };
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
      const result = await questionApi.update(id, patch);
      return result;
    } catch (err) {
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
