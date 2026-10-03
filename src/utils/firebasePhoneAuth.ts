import { Platform } from 'react-native';

export type FirebasePhoneChallenge = { confirm(code: string): Promise<string> };

export async function sendFirebasePhoneCode(phone: string): Promise<FirebasePhoneChallenge> {
  if (Platform.OS === 'web') return (await import('./firebasePhoneAuth.web')).sendFirebasePhoneCode(phone);
  return (await import('./firebasePhoneAuth.native')).sendFirebasePhoneCode(phone);
}

export async function resetFirebasePhoneCode() {
  if (Platform.OS === 'web') await (await import('./firebasePhoneAuth.web')).resetFirebasePhoneCode();
}

export async function signOutFirebasePhoneUser() {
  if (Platform.OS === 'web') return (await import('./firebasePhoneAuth.web')).signOutFirebasePhoneUser();
  return (await import('./firebasePhoneAuth.native')).signOutFirebasePhoneUser();
}

export function firebasePhoneError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  if (message === 'FIREBASE_WEB_CONFIG_MISSING') return 'Phone sign-in is not configured in this app.';
  if (message === 'FIREBASE_RECAPTCHA_NOT_READY') return 'Security verification is still loading. Try again in a moment.';
  const code = typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string'
    ? error.code
    : '';
  switch (code) {
    case 'auth/invalid-phone-number':
    case 'auth/missing-phone-number': return 'Enter a valid phone number with its country code.';
    case 'auth/invalid-verification-code': return 'That code is incorrect. Check it and try again.';
    case 'auth/code-expired':
    case 'auth/session-expired': return 'That code has expired. Request a new one.';
    case 'auth/too-many-requests':
    case 'auth/quota-exceeded': return 'Too many code requests. Wait a while before trying again.';
    case 'auth/network-request-failed': return 'Network error. Check your connection and try again.';
    case 'auth/captcha-check-failed':
    case 'auth/invalid-app-credential':
    case 'auth/app-not-authorized':
    case 'auth/unauthorized-domain': return 'Phone verification could not start. Check the Firebase app configuration.';
    case 'auth/operation-not-allowed': return 'Phone sign-in is not enabled for this Firebase project.';
    default: return 'Phone verification could not be completed. Try again.';
  }
}