import type { ICurrentUser } from '@sos-academy/shared';
import { AuthService } from './auth-service';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4200/api';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const request = (endpoint: string, init: RequestInit, token: string | null) =>
  fetch(`${API_URL}${endpoint}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

/**
 * Call the API with the stored access token, refreshing it once if it has expired
 * @throws ApiError on non-2xx responses (401 means the session couldn't be refreshed)
 */
export async function apiFetch<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  let response = await request(endpoint, init, AuthService.getAccessToken());

  if (response.status === 401) {
    const refreshedToken = await AuthService.refreshAccessToken();
    if (refreshedToken) {
      response = await request(endpoint, init, refreshedToken);
    }
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiError(data?.message || response.statusText, response.status);
  }
  return data as T;
}

/**
 * Fetch the logged-in user from the server, which reads it from the database:
 * unlike the user stored at login, its role and status are always up to date.
 */
export const getCurrentUser = () => apiFetch<ICurrentUser>('/auth/me');
