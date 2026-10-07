import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, signOut, type ConfirmationResult } from 'firebase/auth';
import type { FirebasePhoneChallenge } from './firebasePhoneShared';

export { firebasePhoneError } from './firebasePhoneShared';
export type { FirebasePhoneChallenge } from './firebasePhoneShared';

let verifier: RecaptchaVerifier | null = null;

function firebaseAuth() {
  const config = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  };
  if (Object.values(config).some((value) => !value?.trim())) throw new Error('FIREBASE_WEB_CONFIG_MISSING');
  const app = getApps().length ? getApp() : initializeApp(config);
  const auth = getAuth(app);
  auth.languageCode = 'en';
  return auth;
}

export async function resetFirebasePhoneCode() {
  try { verifier?.clear(); } catch {}
  verifier = null;
}

export async function signOutFirebasePhoneUser() {
  await signOut(firebaseAuth());
}

export async function sendFirebasePhoneCode(phone: string): Promise<FirebasePhoneChallenge> {
  if (typeof document === 'undefined' || !document.getElementById('lemontrip-phone-recaptcha')) {
    throw new Error('FIREBASE_RECAPTCHA_NOT_READY');
  }
  await resetFirebasePhoneCode();
  const auth = firebaseAuth();
  verifier = new RecaptchaVerifier(auth, 'lemontrip-phone-recaptcha', { size: 'normal' });
  let confirmation: ConfirmationResult;
  try {
    confirmation = await signInWithPhoneNumber(auth, phone, verifier);
  } catch (error) {
    await resetFirebasePhoneCode();
    throw error;
  }
  return {
    confirm: async (code) => {
      const credential = await confirmation.confirm(code);
      return credential.user.getIdToken(true);
    },
  };
}
