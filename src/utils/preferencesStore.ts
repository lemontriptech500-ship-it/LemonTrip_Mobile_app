import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './authStore';
import { useEffect, useState } from 'react';

type Preferences = { language: string; currency: string; bookings: boolean; offers: boolean; emails: boolean };
const defaults: Preferences = { language: 'English', currency: 'INR', bookings: true, offers: false, emails: true };
export function usePreferences() {
  const user = useAuth(); const key = `lemontrip-ui:${user?.id ?? 'guest'}:preferences`;
  const [state, setState] = useState({ key: '', value: defaults }); const [error, setError] = useState('');
  useEffect(() => { let active = true; void AsyncStorage.getItem(key).then(raw => { const parsed: unknown = raw ? JSON.parse(raw) : null; const value = { ...defaults }; if (parsed && typeof parsed === 'object') { if ('currency' in parsed && typeof parsed.currency === 'string' && ['INR', 'USD', 'EUR', 'GBP'].includes(parsed.currency)) value.currency = parsed.currency; for (const field of ['bookings', 'offers', 'emails'] as const) if (field in parsed && typeof (parsed as Preferences)[field] === 'boolean') value[field] = (parsed as Preferences)[field]; } if (active) setState({ key, value }); }).catch(() => { if (active) setError('Preferences could not be loaded.'); }); return () => { active = false; }; }, [key]);
  const value = state.key === key ? state.value : defaults;
  const update = async (patch: Partial<Preferences>) => { const next = { ...value, ...patch }; try { await AsyncStorage.setItem(key, JSON.stringify(next)); setState({ key, value: next }); setError(''); } catch { setError('Preferences could not be saved.'); } };
  return { value, update, error };
}
