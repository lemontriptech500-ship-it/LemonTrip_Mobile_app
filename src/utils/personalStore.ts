import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './authStore';

export type SavedTraveller = { id: string; firstName: string; lastName: string };
export type SavedSearch = { id: string; label: string; service: string; query: string; createdAt: string };
export function usePersonalItems<T>(name: string, validate: (item: unknown) => item is T) {
  const user = useAuth();
  const key = `lemontrip-ui:${user?.id ?? 'guest'}:${name}`;
  const [state, setState] = useState<{ key: string; items: T[] }>({ key, items: [] });
  const [error, setError] = useState('');
  useFocusEffect(useCallback(() => {
    let active = true;
    void AsyncStorage.getItem(key).then(raw => {
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (active) setState({ key, items: Array.isArray(parsed) ? parsed.filter(validate) : [] });
    }).catch(() => { if (active) setError('Saved items could not be loaded on this device.'); });
    return () => { active = false; };
  }, [key, validate]));
  const items = state.key === key ? state.items : [];
  const save = async (next: T[]) => {
    try { await AsyncStorage.setItem(key, JSON.stringify(next)); setState({ key, items: next }); setError(''); return true; }
    catch { setError('Could not save on this device. Please try again.'); return false; }
  };
  return { items, save, error };
}
export function isTraveller(value: unknown): value is SavedTraveller { return typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string' && 'firstName' in value && typeof value.firstName === 'string' && 'lastName' in value && typeof value.lastName === 'string'; }
export function isSearch(value: unknown): value is SavedSearch { return typeof value === 'object' && value !== null && 'id' in value && typeof value.id === 'string' && 'label' in value && typeof value.label === 'string' && 'query' in value && typeof value.query === 'string' && 'service' in value && typeof value.service === 'string' && 'createdAt' in value && typeof value.createdAt === 'string'; }

export async function recordRecentSearch(service: string, label: string, query: string) {
  const { getUser } = await import('./authStore');
  const key = `lemontrip-ui:${getUser()?.id ?? 'guest'}:recent-searches`;
  try {
    const raw = await AsyncStorage.getItem(key); const parsed: unknown = raw ? JSON.parse(raw) : [];
    const items = Array.isArray(parsed) ? parsed.filter(isSearch) : [];
    const item: SavedSearch = { id: `search-${Date.now()}`, service, label, query, createdAt: new Date().toISOString() };
    await AsyncStorage.setItem(key, JSON.stringify([item, ...items.filter(old => old.service !== service || old.query !== query)].slice(0, 20)));
  } catch { /* A storage failure does not prevent a travel search. */ }
}

export function parseSavedQuery(query: string | undefined): Record<string, unknown> {
  try { const parsed: unknown = query ? JSON.parse(query) : null; return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {}; } catch { return {}; }
}
