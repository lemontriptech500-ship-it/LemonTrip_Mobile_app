import { getAccessToken } from './authStore';

export async function featureRequest<T>(base: string | undefined, path: string, options?: { method: string; body: unknown }): Promise<T> {
  if (!base) throw new Error('This service is temporarily unavailable. Please contact LemonTrip for help.');
  const token = getAccessToken(); if (!token) throw new Error('Sign in to access your account.');
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${base.replace(/\/$/, '')}${path}`, { method: options?.method ?? 'GET', headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(options ? { 'Content-Type': 'application/json' } : {}) }, ...(options ? { body: JSON.stringify(options.body) } : {}), signal: controller.signal });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) { const apiMessage = response.status === 400 && typeof data === 'object' && data !== null && typeof (data as { error?: unknown }).error === 'string' ? (data as { error: string }).error : ''; throw new Error(response.status === 401 ? 'Your session expired. Sign in again.' : apiMessage || 'This service could not complete your request. Please try again.'); }
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

export type CouponResult = { valid: boolean; code: string; discountType: string; discountValue: number; discountAmount: number };
export async function validateCoupon(code: string, serviceType: string, orderAmount?: number) {
  const data = await featureRequest<CouponResult>(process.env.EXPO_PUBLIC_WALLET_API_URL, '/coupons/validate', { method: 'POST', body: { code, serviceType, ...(orderAmount !== undefined ? { orderAmount } : {}) } });
  if (data.valid !== true || typeof data.code !== 'string' || !Number.isFinite(data.discountAmount)) throw new Error('This coupon could not be verified.');
  return data;
}

export type AccountProfile = { id: string; email: string | null; phone: string | null; name: string; firstName: string; lastName: string | null; emailVerified: boolean; phoneVerified: boolean; dateOfBirth: string | null; gender: string | null; nationality: string | null };
function accountBase() { return process.env.EXPO_PUBLIC_API_URL ? `${process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, '')}/api` : undefined; }
export async function loadProfile() {
  const data = await featureRequest<{ profile: AccountProfile }>(accountBase(), '/profile');
  if (typeof data.profile !== 'object' || data.profile === null || typeof data.profile.id !== 'string') throw new Error('Your profile could not be verified. Please try again.');
  return data.profile;
}
export async function updateProfile(input: { firstName?: string; lastName?: string | null }) {
  const data = await featureRequest<{ profile: AccountProfile }>(accountBase(), '/profile', { method: 'PATCH', body: input });
  if (typeof data.profile !== 'object' || data.profile === null || typeof data.profile.name !== 'string') throw new Error('Your profile update could not be verified.');
  return data.profile;
}
export async function changePassword(currentPassword: string | undefined, newPassword: string) {
  return featureRequest<{ success: boolean; otherSessionsLoggedOut?: number }>(accountBase(), '/profile/password', { method: 'POST', body: { ...(currentPassword ? { currentPassword } : {}), newPassword } });
}