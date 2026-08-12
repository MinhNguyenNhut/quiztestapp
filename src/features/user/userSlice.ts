import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../store.ts';
import type { User } from '../../types/user.ts';
import { loginUser, logout, initializeAuth, registerUser } from '../auth/authSlice.ts';

interface UserState {
   profile: User | null;
}

const initialState: UserState = {
   profile: null,
};

const userSlice = createSlice({
   name: 'user',
   initialState,
   reducers: {
      setProfile(state, action: PayloadAction<User>) {
         state.profile = action.payload;
      },
      updateProfile(state, action: PayloadAction<Partial<User>>) {
         if (state.profile) {
            state.profile = { ...state.profile, ...action.payload };
         }
      },
      clearProfile(state) {
         state.profile = null;
      },
   },
   extraReducers: (builder) => {
      builder
         .addCase(loginUser.fulfilled, (state, action) => {
            state.profile = action.payload.user;
         })
         .addCase(initializeAuth.fulfilled, (state, action) => {
            state.profile = action.payload.user;
         })
         .addCase(initializeAuth.rejected, (state) => {
            state.profile = null;
         })
         .addCase(logout, (state) => {
            state.profile = null;
         })
         .addCase(registerUser.fulfilled, (state, action) => {
            state.profile = action.payload.user;
         });
   },
});

export const { setProfile, updateProfile, clearProfile } = userSlice.actions;

export const getUserProfile = (state: RootState) => state.user.profile;
export const getUserRole = (state: RootState) => state.user.profile?.role ?? null;

export default userSlice.reducer;
