import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '../types/user.ts';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Flip to false once the NestJS backend is wired up — everything downstream
// (authSlice, userSlice, LoginPage, RegisterPage) is unaffected either way.
const USE_MOCK_AUTH = true;

const MOCK_DELAY_MS = 400;
const MOCK_USERS_KEY = 'mock_users_db';

interface MockUserRecord extends User {
  password: string;
}

function readMockUsers(): MockUserRecord[] {
  try {
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeMockUsers(users: MockUserRecord[]): void {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toToken(userId: string): string {
  return `mock_token_${userId}`;
}

function fromToken(token: string): string | null {
  return token.startsWith('mock_token_') ? token.slice('mock_token_'.length) : null;
}

function stripPassword(user: MockUserRecord): User {
  const { password: _password, ...rest } = user;
  return rest;
}

async function mockLogin(credentials: LoginCredentials): Promise<AuthResponse> {
  await delay(MOCK_DELAY_MS);
  const users = readMockUsers();
  const match = users.find(
    (u) => u.email.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password,
  );
  if (!match) throw new Error('Invalid email or password');
  return { token: toToken(match.id), user: stripPassword(match) };
}

async function mockRegister(data: RegisterCredentials): Promise<AuthResponse> {
  await delay(MOCK_DELAY_MS);
  const users = readMockUsers();
  if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error('An account with this email already exists');
  }
  const newUser: MockUserRecord = {
    id: crypto.randomUUID(),
    email: data.email,
    name: data.name,
    role: 'user',
    password: data.password,
  };
  writeMockUsers([...users, newUser]);
  return { token: toToken(newUser.id), user: stripPassword(newUser) };
}

async function mockFetchMe(token: string): Promise<User> {
  await delay(MOCK_DELAY_MS / 2);
  const userId = fromToken(token);
  const match = readMockUsers().find((u) => u.id === userId);
  if (!match) throw new Error('Session expired');
  return stripPassword(match);
}

async function realLogin(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Login failed');
  }
  return res.json();
}

async function realRegister(data: RegisterCredentials): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? 'Registration failed');
  }
  return res.json();
}

async function realFetchMe(token: string): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Session expired');
  return res.json();
}

export const loginRequest = USE_MOCK_AUTH ? mockLogin : realLogin;
export const registerRequest = USE_MOCK_AUTH ? mockRegister : realRegister;
export const fetchMe = USE_MOCK_AUTH ? mockFetchMe : realFetchMe;
