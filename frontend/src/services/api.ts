/**
 * Thin fetch wrapper around the real GlobeTrotter backend (see ../../../src
 * for the Express/Prisma API this talks to).
 *
 * Every backend response uses one envelope:
 *   success: { success: true, data, meta? }
 *   error:   { success: false, error: { code, message, details? } }
 * apiClient unwraps that and returns `{ data, meta? }`, throwing
 * ApiRequestError on failure. A 401 (outside the refresh call itself, or
 * when the call opts out of auth) triggers a single-flight token refresh
 * and one retry before giving up and clearing the session.
 */

const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:4000/api/v1';

const ACCESS_TOKEN_KEY = 'globetrotter_access_token';
const REFRESH_TOKEN_KEY = 'globetrotter_refresh_token';

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },
  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
  hasSession(): boolean {
    return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
  },
};

/** Alias kept for call sites written against the other naming convention that's been in flux in this file — same object, same behavior. */
export const tokenStore = tokenStorage;

export class ApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** Alias kept for the same reason as `tokenStore` above. */
export const ApiError = ApiRequestError;

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

interface ErrorEnvelope {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

export type QueryParams = Record<string, string | number | boolean | undefined>;

function buildUrl(path: string, query?: QueryParams): string {
  let url = `${API_BASE_URL}${path}`;
  if (query) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') params.set(key, String(value));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }
  return url;
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = tokenStorage.getRefreshToken();
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    const body = (await res.json().catch(() => null)) as SuccessEnvelope<{
      tokens: { accessToken: string; refreshToken: string };
    }> | null;

    if (!res.ok || !body?.success) return false;
    tokenStorage.setTokens(body.data.tokens.accessToken, body.data.tokens.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export interface ApiResult<T> {
  data: T;
  meta?: PaginationMeta;
}

async function request<T>(
  path: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body: unknown,
  auth: boolean,
  query?: QueryParams,
  isRetryAfterRefresh = false,
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = tokenStorage.getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, query), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const payload = (await res.json().catch(() => null)) as SuccessEnvelope<T> | ErrorEnvelope | null;

  if (res.status === 401 && auth && !isRetryAfterRefresh) {
    refreshInFlight ??= refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
    const refreshed = await refreshInFlight;

    if (refreshed) {
      return request<T>(path, method, body, auth, query, true);
    }
    tokenStorage.clearTokens();
  }

  if (!res.ok || !payload || payload.success === false) {
    const err = payload && !payload.success ? payload.error : undefined;
    throw new ApiRequestError(
      res.status,
      err?.code ?? 'UNKNOWN_ERROR',
      err?.message ?? 'Something went wrong. Please try again.',
      err?.details,
    );
  }

  return { data: payload.data, meta: payload.meta };
}

export const apiClient = {
  get: <T>(path: string, query?: QueryParams, auth = true) =>
    request<T>(path, 'GET', undefined, auth, query),
  post: <T>(path: string, body?: unknown, auth = true) => request<T>(path, 'POST', body, auth),
  patch: <T>(path: string, body?: unknown, auth = true) => request<T>(path, 'PATCH', body, auth),
  delete: <T>(path: string, auth = true) => request<T>(path, 'DELETE', undefined, auth),
};

/**
 * Alias for call sites written against the single-function convention:
 * returns `data` directly (not `{ data, meta }`) and takes an options bag
 * instead of positional args. Same underlying request pipeline as
 * apiClient, so both conventions share one refresh/error implementation.
 */
export async function apiRequest<T>(
  path: string,
  options: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown; skipAuth?: boolean; query?: QueryParams } = {},
): Promise<T> {
  const { method = 'GET', body, skipAuth = false, query } = options;
  const result = await request<T>(path, method, body, !skipAuth, query);
  return result.data;
}
