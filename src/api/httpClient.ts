/**
 * Shared HTTP client used by the domain API modules
 * (quizApi, questionApi, submissionApi).
 *
 * The client is a thin wrapper around `fetch` so we don't add a runtime
 * dependency on axios. It installs two cross-cutting concerns once:
 *
 *  1. A Bearer-token request interceptor that reads the latest token
 *     from localStorage (the same key authSlice writes). Reading the
 *     storage directly — rather than importing the auth slice — avoids
 *     a circular import: api → slice → api.
 *
 *  2. A 401 response interceptor that dispatches `authSlice.logout`.
 *     Because the api module can't dispatch directly (no store reference
 *     and a circular import risk), we accept a `setUnauthorizedHandler`
 *     the app root wires up once at boot.
 */

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:3000';

const TOKEN_STORAGE_KEY = 'auth_token';

/** Hook for the 401 interceptor; wired by main.tsx. */
let onUnauthorized: (() => void) | null = null;

/**
 * Register a global handler fired whenever a request returns 401.
 * Called once during app boot from `main.tsx`.
 */
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Extra headers (auth header is added automatically). */
  headers?: Record<string, string>;
  /** Query-string params appended to the URL. */
  params?: Record<string, string | number | undefined>;
  /** When false, skip the Bearer-token interceptor (public endpoints). */
  withAuth?: boolean;
  /** Abort signal for cancellation. */
  signal?: AbortSignal;
}

export class HttpError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.payload = payload;
  }
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const base = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  if (!params) return `${base}${normalized}`;
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  if (!qs) return `${base}${normalized}`;
  return `${base}${normalized}?${qs}`;
}

async function parseError(res: Response): Promise<{ message: string; payload: unknown }> {
  let payload: unknown = null;
  let message = `Request failed (${res.status})`;
  try {
    payload = await res.json();
  } catch {
    // Non-JSON body — keep the generic message.
  }
  if (payload && typeof payload === 'object') {
    const p = payload as { message?: unknown };
    if (typeof p.message === 'string') message = p.message;
    else if (Array.isArray(p.message) && p.message.length > 0 && typeof p.message[0] === 'string') {
      message = (p.message as string[]).join('; ');
    }
  }
  return { message, payload };
}

interface ApiEnvelope<T> {
  data: T;
  success: boolean;
}

function isEnvelope<T>(payload: unknown): payload is ApiEnvelope<T> {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    'success' in payload &&
    'data' in payload
  );
}

/**
 * Issue an authenticated JSON request. The path is appended to
 * `VITE_API_URL` (defaults to `http://localhost:3000`); add an `/api`
 * prefix in the caller — it stays explicit so domain APIs read cleanly.
 */
export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = 'GET',
    body,
    headers: extraHeaders = {},
    params,
    withAuth = true,
    signal,
  } = options;

  const headers: Record<string, string> = { ...extraHeaders };
  if (body !== undefined && headers['Content-Type'] === undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (withAuth) {
    const token = readToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal,
  });

  if (res.status === 401) {
    if (onUnauthorized) onUnauthorized();
    const { message } = await parseError(res);
    throw new HttpError(401, message);
  }

  if (!res.ok) {
    const { message, payload } = await parseError(res);
    throw new HttpError(res.status, message, payload);
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return undefined as T;
  }

  const json = await res.json();
  return (isEnvelope<T>(json) ? json.data : json) as T;
}

/** Convenience for GETs. */
export const apiGet = <T = unknown>(path: string, opts: Omit<RequestOptions, 'method' | 'body'> = {}) =>
  apiRequest<T>(path, { ...opts, method: 'GET' });

/** Convenience for POSTs. */
export const apiPost = <T = unknown>(path: string, body?: unknown, opts: Omit<RequestOptions, 'method'> = {}) =>
  apiRequest<T>(path, { ...opts, method: 'POST', body });

/** Convenience for PATCHes. */
export const apiPatch = <T = unknown>(path: string, body?: unknown, opts: Omit<RequestOptions, 'method'> = {}) =>
  apiRequest<T>(path, { ...opts, method: 'PATCH', body });

/** Convenience for DELETEs. */
export const apiDelete = <T = unknown>(path: string, opts: Omit<RequestOptions, 'method' | 'body'> = {}) =>
  apiRequest<T>(path, { ...opts, method: 'DELETE' });
