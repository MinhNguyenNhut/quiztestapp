import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/user.ts';
import { apiGet, apiPost } from './httpClient';

interface ApiEnvelope<T> {
  data: T;
  success: boolean;
}

export const loginRequest = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  return await apiPost<AuthResponse>(
    '/api/auth/login',
    credentials,
    { withAuth: false }
  );
};

export const registerRequest = async (
  data: RegisterCredentials
): Promise<AuthResponse> => {
  return await apiPost<AuthResponse>(
    '/api/auth/register',
    data,
    { withAuth: false }
  );
};

export const fetchMe = async (_token: string): Promise<User> => {
  void _token;
  const res = await apiGet<ApiEnvelope<User>>('/api/auth/me');
  return res.data;
};
