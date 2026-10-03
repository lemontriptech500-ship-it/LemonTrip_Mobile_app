import type { FirebasePhoneChallenge } from './firebasePhoneShared';

export { firebasePhoneError } from './firebasePhoneShared';
export type { FirebasePhoneChallenge } from './firebasePhoneShared';

function nativeAuth() {
  try {
    return require('@react-native-firebase/auth');
  } catch {
    throw new Error('FIREBASE_NATIVE_MODULE_MISSING');
  }
}

export async function resetFirebasePhoneCode() {}

export async function signOutFirebasePhoneUser() {
  const { getAuth, signOut } = nativeAuth();
  await signOut(getAuth());
}

export async function sendFirebasePhoneCode(phone: string): Promise<FirebasePhoneChallenge> {
  const { getAuth, signInWithPhoneNumber } = nativeAuth();
  const confirmation = await signInWithPhoneNumber(getAuth(), phone);
  return {
    confirm: async (code) => {
      const credential = await confirmation.confirm(code);
      if (!credential?.user) throw new Error('FIREBASE_CREDENTIAL_MISSING');
      return credential.user.getIdToken(true);
    },
  };
}