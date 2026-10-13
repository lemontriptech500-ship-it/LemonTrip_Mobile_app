import { clearCheckoutDetails } from '@/utils/checkoutStore';
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { refreshAuthSession, revokeAuthSession, type AuthSession, type AuthUser } from '@/utils/authApi';
import { signOutFirebasePhoneUser } from '@/utils/firebasePhoneAuthService';
import { signOutGoogleUser } from '@/utils/googleNativeAuth';

export type User = AuthUser;

let currentUser: User | null = null;
let accessToken: string | null = null;
let restoring = false;
let restoreAttempted = false;
let authEpoch = 0; // bumped on every login/logout so a slow background restore can't overwrite newer state
let listeners: (() => void)[] = [];
const REFRESH_TOKEN_KEY = 'lemontrip-refresh-token';

function notify() {
  listeners.forEach((listener) => listener());
}

export async function login(session: AuthSession) {
  authEpoch += 1;
  restoreAttempted = true;
  if (currentUser?.id !== session.user.id) clearCheckoutDetails();
  currentUser = session.user;
  accessToken = session.accessToken;
  notify();
  if (Platform.OS !== 'web' && session.refreshToken) {
    try { await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken); } catch { /* session still works until the app closes */ }
  }
}

export function logout() {
  authEpoch += 1;
  clearCheckoutDetails();
  if (accessToken) void revokeAuthSession(accessToken);
  void signOutFirebasePhoneUser().catch(() => undefined);
  if (Platform.OS !== 'web') void signOutGoogleUser();
  if (Platform.OS !== 'web') void SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  currentUser = null;
  accessToken = null;
  notify();
}

export function getUser() {
  return currentUser;
}

export function getAccessToken() {
  return accessToken;
}

async function restoreSession() {
  if (restoring || restoreAttempted || currentUser) return; // restore only once, and never when already signed in
  restoring = true;
  restoreAttempted = true;
  const epoch = authEpoch;
  try {
    const savedRefreshToken = Platform.OS === 'web' ? '' : await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (Platform.OS !== 'web' && !savedRefreshToken) return;
    const session = await refreshAuthSession(savedRefreshToken ?? '');
    if (epoch !== authEpoch) return; // user logged in/out while this was running
    currentUser = session.user;
    accessToken = session.accessToken;
    if (Platform.OS !== 'web' && session.refreshToken) await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken);
  } catch {
    if (epoch !== authEpoch) return;
    currentUser = null;
    accessToken = null;
    if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => undefined);
  } finally {
    restoring = false;
    notify();
  }
}

export function useAuth() {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.push(listener);
    void restoreSession();
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  return currentUser;
}