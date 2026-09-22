import { getApiBaseUrl } from './config';
import { clearSession, getAccessToken, getRefreshToken, saveSession } from '../storage/session';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  auth?: boolean;
};

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/auth/refresh`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    await clearSession();
    return null;
  }

  const accessToken = payload?.data?.access_token || payload?.data?.session?.access_token;
  const nextRefresh = payload?.data?.refresh_token || payload?.data?.session?.refresh_token;
  if (!accessToken) {
    await clearSession();
    return null;
  }
  await saveSession(accessToken, nextRefresh);
  return accessToken as string;
}

function refreshOnce() {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiRequest<T = any>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = options;
  let token = options.token;
  if (auth && token === undefined) {
    token = await getAccessToken();
  }

  const send = (accessToken?: string | null) => {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    return fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  };

  let response: Response;
  try {
    response = await send(token);
  } catch {
    throw new ApiError('Cannot reach the server. Start the backend and check the API URL.');
  }

  if (response.status === 401 && auth && options.token === undefined) {
    const nextToken = await refreshOnce();
    if (nextToken) {
      try {
        response = await send(nextToken);
      } catch {
        throw new ApiError('Cannot reach the server. Start the backend and check the API URL.');
      }
    }
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error || payload?.message || 'Request failed';
    throw new ApiError(typeof message === 'string' ? message : 'Request failed', response.status);
  }
  return payload as T;
}
