// src/features/meeting/useAuthToken.ts
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

// Adjust to wherever authSlice keeps the JWT
export const useAuthToken = () => useSelector((s: RootState) => s.auth.token) ?? '';