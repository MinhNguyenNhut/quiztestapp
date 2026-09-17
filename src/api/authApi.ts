import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/user.ts';
import { apiGet, apiPost } from './httpClient';

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
  return await apiGet<User>('/api/auth/me');
};
