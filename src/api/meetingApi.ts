const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000'
).replace(/\/+$/, '');

export interface Meeting {
  roomId: string;
  title: string;
  hostId: string;
  isActive: boolean;
  maxParticipants: number;
}

export interface CreatedMeeting {
  roomId: string;
}

export class MeetingApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'MeetingApiError';
    this.status = status;
  }
}

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function unwrapMeeting(value: unknown): unknown {
  let current = value;
  for (let depth = 0; depth < 3 && isRecord(current); depth += 1) {
    if (typeof current.roomId === 'string' || typeof current.id === 'string') {
      return current;
    }
    if ('data' in current) {
      current = current.data;
    } else if ('meeting' in current) {
      current = current.meeting;
    } else {
      break;
    }
  }
  return current;
}

function extractRoomId(value: unknown): string {
  const meeting = unwrapMeeting(value);
  if (isRecord(meeting)) {
    const roomId =
      typeof meeting.roomId === 'string'
        ? meeting.roomId
        : typeof meeting.id === 'string'
          ? meeting.id
          : '';
    if (roomId.trim()) return roomId;
  }
  throw new Error('The server did not return a meeting room ID.');
}

function normalizeMeeting(value: unknown): Meeting {
  const meeting = unwrapMeeting(value);
  if (
    !isRecord(meeting) ||
    typeof meeting.isActive !== 'boolean'
  ) {
    throw new Error('Invalid meeting details returned by the server.');
  }
  return {
    roomId: extractRoomId(meeting),
    title: typeof meeting.title === 'string' ? meeting.title : '',
    hostId: typeof meeting.hostId === 'string' ? meeting.hostId : '',
    isActive: meeting.isActive,
    maxParticipants:
      typeof meeting.maxParticipants === 'number' ? meeting.maxParticipants : 0,
  };
}

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const body: unknown = await res.json().catch(() => null);
    const message =
      typeof body === 'object' &&
      body !== null &&
      'message' in body &&
      typeof body.message === 'string'
        ? body.message
        : `Request failed (${res.status})`;
    throw new MeetingApiError(message, res.status);
  }

  if (res.status === 204 || !res.headers.get('content-type')?.includes('application/json')) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export const createMeeting = (
  token: string,
  body: { title?: string; maxParticipants?: number },
) =>
  request<unknown>('/meetings', token, { method: 'POST', body: JSON.stringify(body) })
    .then(extractRoomId)
    .then((roomId): CreatedMeeting => ({ roomId }));

export const getMeeting = (roomId: string, token: string) =>
  request<unknown>(`/meetings/${encodeURIComponent(roomId)}`, token).then(normalizeMeeting);

export const getMyMeetings = (token: string) =>
  request<unknown>('/meetings/mine', token).then((response) => {
    const candidate: unknown =
      Array.isArray(response)
        ? response
        : typeof response === 'object' && response !== null && 'data' in response
          ? response.data
          : null;

    if (!Array.isArray(candidate)) {
      throw new Error('Invalid response from the recent meetings endpoint.');
    }

    return candidate.map(normalizeMeeting);
  });

export const endMeeting = (roomId: string, token: string) =>
  request<void>(`/meetings/${encodeURIComponent(roomId)}/end`, token, { method: 'POST' });

export const deleteMeeting = (roomId: string, token: string) =>
  request<void>(`/meetings/${encodeURIComponent(roomId)}`, token, { method: 'DELETE' });
