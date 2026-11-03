// src/features/meeting/meetingApi.ts
const API_URL = import.meta.env.VITE_API_URL as string;

export interface Meeting {
  roomId: string;
  title: string;
  hostId: string;
  isActive: boolean;
  maxParticipants: number;
}

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export const createMeeting = (
  token: string,
  body: { title?: string; maxParticipants?: number },
) => request<Meeting>('/meetings', token, { method: 'POST', body: JSON.stringify(body) });

export const getMeeting = (roomId: string, token: string) =>
  request<Meeting>(`/meetings/${roomId}`, token);