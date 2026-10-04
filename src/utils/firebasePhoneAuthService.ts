import { Platform } from 'react-native';
import type { FirebasePhoneChallenge } from './firebasePhoneShared';
export { firebasePhoneError } from './firebasePhoneShared';

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
