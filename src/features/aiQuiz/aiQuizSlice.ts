import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AiQuizGenerationResult, AiQuizRequestError, GenerateAiQuizRequest } from '../../api/aiQuizApi';
import { aiQuizApi, toAiQuizRequestError } from '../../api/aiQuizApi';

interface AiQuizState {
  generated: AiQuizGenerationResult | null;
  isGenerating: boolean;
  error: AiQuizRequestError | null;
}

const initialState: AiQuizState = {
  generated: null,
  isGenerating: false,
  error: null,
};

export const generateAiQuiz = createAsyncThunk<
  AiQuizGenerationResult,
  GenerateAiQuizRequest,
  { rejectValue: AiQuizRequestError }
>('aiQuiz/generate', async (request, { rejectWithValue }) => {
  try {
    return await aiQuizApi.generate(request);
  } catch (error: unknown) {
    return rejectWithValue(toAiQuizRequestError(error));
  }
});

const aiQuizSlice = createSlice({
  name: 'aiQuiz',
  initialState,
  reducers: {
    removeGeneratedQuestion(state, action: PayloadAction<number>) {
      state.generated?.questions.splice(action.payload, 1);
    },
    clearGeneratedQuiz(state) {
      state.generated = null;
      state.error = null;
      state.isGenerating = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateAiQuiz.pending, (state) => {
        state.isGenerating = true;
        state.error = null;
      })
      .addCase(generateAiQuiz.fulfilled, (state, action) => {
        state.isGenerating = false;
        state.generated = action.payload;
      })
      .addCase(generateAiQuiz.rejected, (state, action) => {
        state.isGenerating = false;
        state.error = action.payload ?? {
          status: null,
          message: action.error.message ?? 'AI quiz generation failed.',
        };
      });
  },
});

export const { removeGeneratedQuestion, clearGeneratedQuiz } = aiQuizSlice.actions;
export default aiQuizSlice.reducer;
