import { Platform } from 'react-native';

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
    const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
      ? payload.error
      : 'Authentication is temporarily unavailable.';
    throw new Error(message);
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

export function sendPhoneOtp(input: { phone: string; purpose: 'signup' | 'login'; name?: string; email?: string; password?: string }) {
  return request<{ success: true; message: string }>('/otp/send', input);
}

export function verifyPhoneOtp(input: { phone: string; code: string; purpose: 'signup' | 'login' }) {
  return request<AuthSession>('/otp/verify', input);
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