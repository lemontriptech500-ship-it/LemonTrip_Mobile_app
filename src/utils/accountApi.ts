import { APP_API_URL } from './apiConfig';
const API_BASE = `${APP_API_URL}/api`;

// Render free servers can take a while to wake up, so allow a long timeout.
const TIMEOUT_MS = 90_000;

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    throw new Error('LemonTrip could not reach the account service. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const result = typeof payload === 'object' && payload !== null ? (payload as { error?: unknown }) : null;
    throw new Error(typeof result?.error === 'string' ? result.error : 'Something went wrong. Please try again.');
  }
  return (payload ?? {}) as T;
}

export function requestPasswordReset(email: string) {
  return post<{ success: boolean; message?: string }>('/auth/forgot-password', { email });
}

export function confirmPasswordReset(token: string, newPassword: string) {
  return post<{ success: boolean }>('/auth/reset-password', { token, newPassword });
}
