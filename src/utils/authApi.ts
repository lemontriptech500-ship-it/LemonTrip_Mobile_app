import { Platform } from 'react-native';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export type AuthPlatform = 'app' | 'website';
export type AuthUser = {
  id: string;
  email: string | null;
  phone: string | null;
  name: string;
  firstName: string;
  lastName: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
};

export type AuthSession = {
  user: AuthUser;
  platform: AuthPlatform;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
};

const authEndpoint = `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/auth`;
export const currentAuthPlatform: AuthPlatform = Platform.OS === 'web' ? 'website' : 'app';

export function normalizePhoneInput(value: string) {
  const parsed = parsePhoneNumberFromString(value.trim(), 'IN');
  return parsed?.isValid() ? parsed.number : null;
}

async function request<T>(path: string, body: Record<string, unknown>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${authEndpoint}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...body, platform: currentAuthPlatform }),
      credentials: 'include',
    });
  } catch {
    throw new Error('LemonTrip could not reach the account service. Check your connection and try again.');
  }
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const result = typeof payload === 'object' && payload !== null ? payload as { error?: unknown; code?: unknown } : null;
    const message = typeof result?.error === 'string'
      ? result.error
      : 'Authentication is temporarily unavailable.';
    const requestError = new Error(message) as Error & { code?: string; status?: number };
    if (typeof result?.code === 'string') requestError.code = result.code;
    requestError.status = response.status;
    throw requestError;
  }
  if (!payload || typeof payload !== 'object') throw new Error('The account service returned an invalid response.');
  return payload as T;
}

export function signupWithEmail(input: { name: string; email: string; phone?: string; password: string }) {
  return request<{ success: true; verificationRequired: true; message: string }>('/signup', input);
}

export function loginWithEmail(input: { email: string; password: string }) {
  return request<AuthSession>('/login', input);
}

export function exchangeFirebasePhoneIdentity(input: { idToken: string; purpose: 'signup' | 'login'; name?: string }) {
  return request<AuthSession>('/firebase/phone', input);
}

export function loginWithGoogle(idToken: string) {
  return request<AuthSession>('/google', { idToken });
}

export function refreshAuthSession(refreshToken: string) {
  return request<AuthSession>('/refresh', refreshToken ? { refreshToken } : {});
}

export async function revokeAuthSession(accessToken: string) {
  try {
    await fetch(`${authEndpoint}/logout`, { method: 'POST', headers: { Authorization: `Bearer ${accessToken}` }, credentials: 'include' });
  } catch {
    // Local credentials are cleared even when the device is offline.
  }
}