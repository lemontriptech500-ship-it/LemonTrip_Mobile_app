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
let listeners: (() => void)[] = [];
const REFRESH_TOKEN_KEY = 'lemontrip-refresh-token';

function notify() {
  listeners.forEach((listener) => listener());
}

export async function login(session: AuthSession) {
  currentUser = session.user;
  accessToken = session.accessToken;
  if (Platform.OS !== 'web' && session.refreshToken) await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken);
  notify();
}

export function logout() {
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
  if (restoring) return;
  restoring = true;
  try {
    const savedRefreshToken = Platform.OS === 'web' ? '' : await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (Platform.OS !== 'web' && !savedRefreshToken) return;
    const session = await refreshAuthSession(savedRefreshToken ?? '');
    currentUser = session.user;
    accessToken = session.accessToken;
    if (Platform.OS !== 'web' && session.refreshToken) await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, session.refreshToken);
  } catch {
    currentUser = null;
    accessToken = null;
    if (Platform.OS !== 'web') await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
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