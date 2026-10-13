import { Platform } from 'react-native';
import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import { getDeviceRegion } from '@/utils/intl';

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
const REQUEST_TIMEOUT_MS = 30_000; // per attempt; never leave the login spinner running forever
export const currentAuthPlatform: AuthPlatform = Platform.OS === 'web' ? 'website' : 'app';

export function normalizePhoneInput(value: string) {
  const parsed = parsePhoneNumberFromString(value.trim(), getDeviceRegion() as CountryCode);
  return parsed?.isValid() ? parsed.number : null;
}

const MAX_ATTEMPTS = 3; // a sleeping host (e.g. Render free tier) needs ~30-60s to wake; retry instead of failing
const RETRY_DELAY_MS = 4_000;
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function request<T>(path: string, body: Record<string, unknown>): Promise<T> {
  let response: Response | undefined;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      response = await fetch(`${authEndpoint}${path}`, {
        signal: controller.signal,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ ...body, platform: currentAuthPlatform }),
        credentials: 'include',
      });
    } catch {
      response = undefined;
    } finally {
      clearTimeout(timer);
    }
    // Retry only when the request never reached the API: no response, or a gateway page (502/503/504) instead of API JSON.
    const gatewayPage = response && [502, 503, 504].includes(response.status)
      && !(response.headers.get('content-type') ?? '').includes('application/json');
    if (response && !gatewayPage) break;
    if (attempt < MAX_ATTEMPTS) await wait(RETRY_DELAY_MS);
    else if (!response) throw new Error('LemonTrip could not reach the account service. Check your connection and try again.');
  }
  if (!response) throw new Error('LemonTrip could not reach the account service. Check your connection and try again.');
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const result = typeof payload === 'object' && payload !== null ? payload as { error?: unknown; code?: unknown } : null;
    const message = typeof result?.error === 'string'
      ? result.error
      : `Authentication is temporarily unavailable. (HTTP ${response.status})`;
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

export function resendVerificationEmail(email: string) {
  return request<{ success: true; message: string }>('/email/send', { email });
}

export function checkPhoneAccount(phone: string, purpose: 'signup' | 'login') {
  return request<{ success: true; allowed: true }>('/phone/check', { phone, purpose });
}

export function loginWithEmail(input: { email: string; password: string }) {
  return request<AuthSession>('/login', input);
}

export function exchangeFirebasePhoneIdentity(input: {
  idToken: string;
  purpose: 'signup' | 'login';
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}) {
  return request<AuthSession>('/firebase/phone', input);
}

export function loginWithGoogle(idToken: string, mode: 'login' | 'signup') {
  return request<AuthSession>('/google', { idToken, mode });
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