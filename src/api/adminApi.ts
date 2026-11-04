import { apiDelete, apiGet } from './httpClient';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readUser(value: unknown): AdminUser {
  if (!isRecord(value)) {
    throw new Error('The users endpoint returned an invalid user.');
  }

  const rawId = typeof value.id === 'string' ? value.id : value._id;
  if (typeof rawId !== 'string' || typeof value.email !== 'string') {
    throw new Error('The users endpoint returned an invalid user.');
  }

  return {
    id: rawId,
    name: typeof value.name === 'string' ? value.name : '',
    email: value.email,
    role: typeof value.role === 'string' ? value.role : 'user',
  };
}

function readUsers(value: unknown): AdminUser[] {
  const payload =
    isRecord(value) && 'data' in value
      ? value.data
      : value;

  if (!Array.isArray(payload)) {
    throw new Error('The users endpoint returned an invalid response.');
  }
  return payload.map(readUser);
}

export const adminApi = {
  listUsers: async () => readUsers(await apiGet<unknown>('/users')),
  deleteUser: (id: string) => apiDelete<unknown>(`/users/${encodeURIComponent(id)}`),
};
