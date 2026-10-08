import { getAccessToken } from './authStore';

export async function featureRequest<T>(base: string | undefined, path: string, options?: { method: string; body: unknown }): Promise<T> {
  if (!base) throw new Error('This service is temporarily unavailable. Please contact LemonTrip for help.');
  const token = getAccessToken(); if (!token) throw new Error('Sign in to access your account.');
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${base.replace(/\/$/, '')}${path}`, { method: options?.method ?? 'GET', headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(options ? { 'Content-Type': 'application/json' } : {}) }, ...(options ? { body: JSON.stringify(options.body) } : {}), signal: controller.signal });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) throw new Error(response.status === 401 ? 'Your session expired. Sign in again.' : 'This service could not complete your request. Please try again.');
    if (typeof data !== 'object' || data === null) throw new Error('The service returned an unreadable response.');
    return data as T;
  } finally { clearTimeout(timeout); }
}
export type WalletData = { balance: number; currency: string; status: string };
export async function loadWallet() {
  const data = await featureRequest<WalletData>(process.env.EXPO_PUBLIC_WALLET_API_URL, '/wallet');
  if (!Number.isFinite(data.balance) || data.balance < 0 || typeof data.currency !== 'string' || !/^[A-Z]{3}$/.test(data.currency)) throw new Error('Wallet balance could not be verified. Please try again.');
  return data;
}
