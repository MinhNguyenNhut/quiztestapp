import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../store.ts';
import type { LoginCredentials, RegisterCredentials } from '../../types/user.ts';
import { loginRequest, fetchMe, registerRequest } from '../../api/authApi.ts';

const TOKEN_STORAGE_KEY = 'auth_token';
type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface AuthState {
   token: string | null;
   status: AsyncStatus;
   initStatus: AsyncStatus;
   error: string | null;
}

const initialState: AuthState = {
   token: localStorage.getItem(TOKEN_STORAGE_KEY),
   status: 'idle',
   initStatus: 'idle',
   error: null,
};

export const loginUser = createAsyncThunk(
   'auth/login',
   async (credentials: LoginCredentials, { rejectWithValue }) => {
      try {
         const result = await loginRequest(credentials);
         return result;
      } catch (err) {
         return rejectWithValue(
            err instanceof Error ? err.message : 'Login failed'
         );
      }
   },
);

export const registerUser = createAsyncThunk(
   'auth/register',
   async (data: RegisterCredentials, { rejectWithValue }) => {
      try {
         return await registerRequest(data);
      } catch (err) {
         return rejectWithValue(err instanceof Error ? err.message : 'Registration failed');
      }
   },
);

/** Verifies a token left over from a previous session and fetches the profile. Dispatched once on app boot. */
export const initializeAuth = createAsyncThunk(
   'auth/initialize',
   async (_: void, { getState, rejectWithValue }) => {
      const token = (getState() as RootState).auth.token;
      if (!token) return rejectWithValue('No token');
      try {
         const user = await fetchMe(token);
         return { token, user };
      } catch (err) {
         return rejectWithValue(err instanceof Error ? err.message : 'Session expired');
      }
   },
);

const authSlice = createSlice({
   name: 'auth',
   initialState,
   reducers: {
      logout(state) {
         state.token = null;
         state.status = 'idle';
         state.error = null;
         localStorage.removeItem(TOKEN_STORAGE_KEY);
      },
      clearAuthError(state) {
         state.error = null;
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(loginUser.pending, (state) => {
            state.status = 'loading';
            state.error = null;
         })
         .addCase(loginUser.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.initStatus = 'succeeded';
            state.token = action.payload.token;
            state.error = null;

            localStorage.setItem(TOKEN_STORAGE_KEY, action.payload.token);
         })
         .addCase(loginUser.rejected, (state, action) => {
            state.status = 'failed';
            state.error = (action.payload as string) ?? action.error.message ?? 'Login failed';
         })
         .addCase(initializeAuth.pending, (state) => {
            state.initStatus = 'loading';
         })
         .addCase(initializeAuth.fulfilled, (state) => {
            state.initStatus = 'succeeded';
         })
         .addCase(initializeAuth.rejected, (state) => {
            state.initStatus = 'failed';
            state.token = null;
            localStorage.removeItem(TOKEN_STORAGE_KEY);
         })
         .addCase(registerUser.pending, (state) => {
            state.status = 'loading';
            state.error = null;
         })
         .addCase(registerUser.fulfilled, (state, action) => {
            state.status = 'succeeded';
            state.initStatus = 'succeeded';
            state.token = action.payload.token;
            state.error = null;
            localStorage.setItem(TOKEN_STORAGE_KEY, action.payload.token);
         })
         .addCase(registerUser.rejected, (state, action) => {
            state.status = 'failed';
            state.error = (action.payload as string) ?? action.error.message ?? 'Registration failed';
         })
   },
});

export const { logout, clearAuthError } = authSlice.actions;

export const getAuthToken = (state: RootState) => state.auth.token;
export const getIsAuthenticated = (state: RootState) => Boolean(state.auth.token);
export const getAuthStatus = (state: RootState) => state.auth.status;
export const getAuthInitStatus = (state: RootState) => state.auth.initStatus;
export const getAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
