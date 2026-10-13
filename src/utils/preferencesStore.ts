import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './authStore';
import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { isCurrencyCode, setIntlPreferences } from './intl';

type Preferences = { language: string; currency: string; bookings: boolean; offers: boolean; emails: boolean };
const defaults: Preferences = { language: 'English', currency: 'INR', bookings: true, offers: false, emails: true };
type Snapshot = { value: Preferences; error: string; version: number; loaded: boolean };
const initial: Snapshot = { value: defaults, error: '', version: 0, loaded: false };
const snapshots = new Map<string, Snapshot>();
const requests = new Map<string, Promise<void>>();
const listeners = new Set<() => void>();
const writes = new Map<string, Promise<void>>();
const getSnapshot = (key: string) => snapshots.get(key) ?? initial;
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};
function publish(key: string, snapshot: Snapshot) {
  snapshots.set(key, snapshot);
  listeners.forEach(listener => listener());
}
function parsePreferences(raw: string | null): Preferences {
  const parsed: unknown = raw ? JSON.parse(raw) : null;
  const value = { ...defaults };
  if (!parsed || typeof parsed !== 'object') return value;
  if ('language' in parsed && parsed.language === 'Hindi') value.language = 'Hindi';
  if ('currency' in parsed && typeof parsed.currency === 'string' && isCurrencyCode(parsed.currency)) value.currency = parsed.currency;
  for (const field of ['bookings', 'offers', 'emails'] as const) {
    if (field in parsed && typeof (parsed as Preferences)[field] === 'boolean') value[field] = (parsed as Preferences)[field];
  }
  return value;
}
function loadPreferences(key: string) {
  if (getSnapshot(key).loaded) return Promise.resolve();
  const pending = requests.get(key);
  if (pending) return pending;
  const version = getSnapshot(key).version;
  const request = AsyncStorage.getItem(key).then(raw => {
    if (getSnapshot(key).version !== version) return;
    publish(key, { value: parsePreferences(raw), error: '', version, loaded: true });
  }).catch(() => {
    if (getSnapshot(key).version !== version) return;
    publish(key, { ...getSnapshot(key), error: 'Preferences could not be loaded.', loaded: true });
  }).finally(() => { requests.delete(key); });
  requests.set(key, request);
  return request;
}

export function usePreferences() {
  const user = useAuth();
  const key = `lemontrip-ui:${user?.id ?? 'guest'}:preferences`;
  const read = useCallback(() => getSnapshot(key), [key]);
  const snapshot = useSyncExternalStore(subscribe, read, () => initial);
  useEffect(() => { void loadPreferences(key); }, [key]);
  useEffect(() => {
    setIntlPreferences(snapshot.value.language, snapshot.value.currency);
  }, [snapshot.value.language, snapshot.value.currency]);

  const update = async (patch: Partial<Preferences>) => {
    const previous = getSnapshot(key);
    const value = { ...previous.value, ...patch };
    const version = previous.version + 1;
    publish(key, { value, version, error: '', loaded: true });
    setIntlPreferences(value.language, value.currency);
    try {
      const pending = writes.get(key) ?? Promise.resolve();
      const write = pending.catch(() => {}).then(() => AsyncStorage.setItem(key, JSON.stringify(value)));
      writes.set(key, write);
      await write;
      if (writes.get(key) === write) writes.delete(key);
    } catch {
      if (getSnapshot(key).version !== version) return;
      publish(key, { value: previous.value, version: version + 1, error: 'Preferences could not be saved.', loaded: true });
      setIntlPreferences(previous.value.language, previous.value.currency);
    }
  };
  return { value: snapshot.value, update, error: snapshot.error };
}
