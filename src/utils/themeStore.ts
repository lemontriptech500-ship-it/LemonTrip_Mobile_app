import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { Appearance, DevSettings, Platform } from 'react-native';
import { applyTheme, type ThemeName } from '@/constants/colors';

const THEME_KEY = 'lemontrip-theme';
const listeners = new Set<(theme: ThemeName) => void>();

export async function getStoredTheme(): Promise<ThemeName> {
  const stored = await AsyncStorage.getItem(THEME_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
}

export function subscribeTheme(listener: (theme: ThemeName) => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function setStoredTheme(theme: ThemeName) {
  await AsyncStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
  listeners.forEach((listener) => listener(theme));

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.location.reload();
    return;
  }

  try {
    await Updates.reloadAsync();
  } catch {
    if (__DEV__) {
      DevSettings.reload();
    }
  }
}

export function useThemeName() {
  const [theme, setThemeState] = useState<ThemeName | null>(null);

  useEffect(() => {
    let mounted = true;

    getStoredTheme().then((storedTheme) => {
      if (!mounted) return;
      applyTheme(storedTheme);
      setThemeState(storedTheme);
    });

    const unsubscribe = subscribeTheme((nextTheme) => {
      if (mounted) {
        setThemeState(nextTheme);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const setTheme = async (nextTheme: ThemeName) => {
    setThemeState(nextTheme);
    await setStoredTheme(nextTheme);
  };

  return { theme, setTheme };
}
