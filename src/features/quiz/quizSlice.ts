import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { Quiz } from '../../types/index.ts';
import type { CandidateFieldsConfig } from '../../types/candidate.ts';
import { quizApi } from '../../api/quizApi.ts';
import {
  fetchQuestionsForQuiz,
  createQuestion,
  deleteQuestion as deleteQuestionThunk,
  reorderQuestions as reorderQuestionThunk,
} from '../questions/questionThunks.ts';

interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: QuizState = {
  quizzes: [],
  currentQuiz: null,
  isLoading: false,
  error: null,
};

const rejectMessage = (err: unknown, fallback: string): string =>
  err instanceof Error ? err.message : fallback;

// ---- Thunks ----

/** GET /api/quizzes — replaces the cached list. */
export const fetchQuizzes = createAsyncThunk<
  Quiz[],
  { page?: number; limit?: number } | void,
  { rejectValue: string }
>('quizzes/fetchAll', async (arg, { rejectWithValue }) => {
  try {
    const { page = 1, limit = 50 } = arg ?? {};
    const res = await quizApi.list(page, limit);
    return res.data;
  } catch (err) {
    return rejectWithValue(rejectMessage(err, 'Failed to load quizzes'));
  }
});

/** GET /api/quizzes/:id — fetches a single quiz (includes nested questions[]). */
export const fetchQuizById = createAsyncThunk<
  Quiz,
  string,
  { rejectValue: string }
>('quizzes/fetchById', async (id, { rejectWithValue }) => {
  try {
    return await quizApi.getById(id);
  } catch (err) {
    return rejectWithValue(rejectMessage(err, 'Failed to load quiz'));
  }
});

/** POST /api/quizzes. */
export const createQuiz = createAsyncThunk<
  Quiz,
  { title: string; description: string; estimatedTime: number; candidateFieldsConfig?: CandidateFieldsConfig },
  { rejectValue: string }
>('quizzes/create', async (payload, { rejectWithValue }) => {
  try {
    return await quizApi.create(payload);
  } catch (err) {
    return rejectWithValue(rejectMessage(err, 'Failed to create quiz'));
  }
});

/** PATCH /api/quizzes/:id. */
export const updateQuiz = createAsyncThunk<
  Quiz,
  { id: string; patch: Partial<Pick<Quiz, 'title' | 'description' | 'estimatedTime' | 'candidateFieldsConfig'>> },
  { rejectValue: string }
>('quizzes/update', async ({ id, patch }, { rejectWithValue }) => {
  try {
    return await quizApi.update(id, patch);
  } catch (err) {
    return rejectWithValue(rejectMessage(err, 'Failed to update quiz'));
  }
});

/** DELETE /api/quizzes/:id. */
export const deleteQuiz = createAsyncThunk<string, string, { rejectValue: string }>(
  'quizzes/delete',
  async (id, { rejectWithValue }) => {
    try {
      await quizApi.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue(rejectMessage(err, 'Failed to delete quiz'));
    }
  },
);

/** PATCH /api/quizzes/:id/candidate-fields — body is `candidateFieldsConfig`. */
export const patchCandidateFields = createAsyncThunk<
  Quiz,
  { quizId: string; config: CandidateFieldsConfig },
  { rejectValue: string }
>('quizzes/patchCandidateFields', async ({ quizId, config }, { rejectWithValue }) => {
  try {
    return await quizApi.patchCandidateFields(quizId, config);
  } catch (err) {
    return rejectWithValue(rejectMessage(err, 'Failed to update candidate fields'));
  }
});

const upsertQuiz = (state: QuizState, quiz: Quiz): void => {
  const idx = state.quizzes.findIndex((q) => q.id === quiz.id);
  if (idx !== -1) state.quizzes[idx] = quiz;
  else state.quizzes.push(quiz);
  if (state.currentQuiz?.id === quiz.id) state.currentQuiz = quiz;
};

const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {
    /** Local-only toggles (UI state). Kept synchronous per the spec. */
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setQuizzes(state, action: PayloadAction<Quiz[]>) {
      state.quizzes = action.payload;
    },
    setCurrentQuiz(state, action: PayloadAction<Quiz | null>) {
      state.currentQuiz = action.payload;
    },
    addQuiz(state, action: PayloadAction<Quiz>) {
      const quiz = action.payload;
      const idx = state.quizzes.findIndex((item) => item.id === quiz.id);
      if (idx === -1) state.quizzes.push(quiz);
      else state.quizzes[idx] = quiz;
      state.currentQuiz = quiz;
    },
    updateCandidateFieldsConfig(
      state,
      action: PayloadAction<{ quizId: string; config: CandidateFieldsConfig }>,
    ) {
      const { quizId, config } = action.payload;
      const target = state.quizzes.find((quiz) => quiz.id === quizId) ?? state.currentQuiz;
      if (!target) return;
      target.candidateFieldsConfig = config;
      if (state.currentQuiz?.id === quizId) {
        state.currentQuiz = { ...state.currentQuiz, candidateFieldsConfig: config };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchQuizzes
      .addCase(fetchQuizzes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuizzes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.quizzes = action.payload;
      })
      .addCase(fetchQuizzes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error.message ?? 'Failed to load quizzes';
      })

      // fetchQuizById
      .addCase(fetchQuizById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchQuizById.fulfilled, (state, action) => {
        state.isLoading = false;
        upsertQuiz(state, action.payload);
        state.currentQuiz = action.payload;
      })
      .addCase(fetchQuizById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error.message ?? 'Failed to load quiz';
      })

      // createQuiz
      .addCase(createQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        upsertQuiz(state, action.payload);
        state.currentQuiz = action.payload;
      })
      .addCase(createQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error.message ?? 'Failed to create quiz';
      })

      // updateQuiz
      .addCase(updateQuiz.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateQuiz.fulfilled, (state, action) => {
        state.isLoading = false;
        upsertQuiz(state, action.payload);
      })
      .addCase(updateQuiz.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? action.error.message ?? 'Failed to update quiz';
      })

      // deleteQuiz
      .addCase(deleteQuiz.fulfilled, (state, action) => {
        state.quizzes = state.quizzes.filter((q) => q.id !== action.payload);
        if (state.currentQuiz?.id === action.payload) state.currentQuiz = null;
      })
      .addCase(deleteQuiz.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? 'Failed to delete quiz';
      })

      // patchCandidateFields
      .addCase(patchCandidateFields.fulfilled, (state, action) => {
        upsertQuiz(state, action.payload);
      })
      .addCase(patchCandidateFields.rejected, (state, action) => {
        state.error = action.payload ?? action.error.message ?? 'Failed to update candidate fields';
      })

      // reorderQuestions — keeps `quiz.questions[]` in sync with the API.
      .addCase(reorderQuestionThunk.fulfilled, (state, action) => {
        const { quizId, questions } = action.payload;
        const quiz = state.quizzes.find((q) => q.id === quizId);
        if (quiz) quiz.questions = questions;
        if (state.currentQuiz?.id === quizId) {
          state.currentQuiz = { ...state.currentQuiz, questions };
        }
      })

      .addCase(fetchQuestionsForQuiz.fulfilled, (state, action) => {
        const { quizId, questions } = action.payload;

        const quiz = state.quizzes.find((q) => q.id === quizId);

        if (quiz) {
          quiz.questions = questions;
        }
      })
      .addCase(createQuestion.fulfilled, (state, action) => {
        const { quizId, question } = action.payload;
        const quiz = state.quizzes.find((q) => q.id === quizId);
        if (quiz) quiz.questions = [...(quiz.questions ?? []), question];
        if (state.currentQuiz?.id === quizId) {
          state.currentQuiz = {
            ...state.currentQuiz,
            questions: [...(state.currentQuiz.questions ?? []), question],
          };
        }
      })
      .addCase(deleteQuestionThunk.fulfilled, (state, action) => {
        const deletedId = action.payload;
        for (const quiz of state.quizzes) {
          quiz.questions = (quiz.questions ?? []).filter((q) => q.id !== deletedId);
        }
        if (state.currentQuiz) {
          state.currentQuiz = {
            ...state.currentQuiz,
            questions: (state.currentQuiz.questions ?? []).filter((q) => q.id !== deletedId),
          };
        }
      });
  },
});

export const {
  setLoading,
  setError,
  setQuizzes,
  setCurrentQuiz,
  addQuiz,
  updateCandidateFieldsConfig,
} = quizSlice.actions;

export default quizSlice.reducer;
