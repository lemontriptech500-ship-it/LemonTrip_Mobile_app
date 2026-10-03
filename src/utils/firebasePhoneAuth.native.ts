import { getAuth, signInWithPhoneNumber, signOut } from '@react-native-firebase/auth';
import type { FirebasePhoneChallenge } from './firebasePhoneAuth';

export async function signOutFirebasePhoneUser() {
  await signOut(getAuth());
}

export async function sendFirebasePhoneCode(phone: string): Promise<FirebasePhoneChallenge> {
  const confirmation = await signInWithPhoneNumber(getAuth(), phone);
  return {
    confirm: async (code) => {
      const credential = await confirmation.confirm(code);
      if (!credential?.user) throw new Error('FIREBASE_CREDENTIAL_MISSING');
      return credential.user.getIdToken(true);
    },
  };
}