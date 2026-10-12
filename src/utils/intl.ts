import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { translateCopy } from '@/i18n/translate';

export type AppLanguage = 'English' | 'Hindi';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'AUD' | 'CAD' | 'CHF' | 'CNY' | 'HKD' | 'IDR' | 'JPY' | 'MYR' | 'NZD' | 'SAR' | 'SGD' | 'THB' | 'TRY' | 'ZAR';

let currentLanguage: AppLanguage = 'English';
let currentCurrency: CurrencyCode = 'INR';
const preferenceListeners = new Set<() => void>();

export function setIntlPreferences(language: string, currency: string) {
  const nextLanguage = language === 'Hindi' ? 'Hindi' : 'English';
  const nextCurrency = isCurrencyCode(currency) ? currency : 'INR';
  if (currentLanguage === nextLanguage && currentCurrency === nextCurrency) return;
  currentLanguage = nextLanguage;
  currentCurrency = nextCurrency;
  preferenceListeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  preferenceListeners.add(listener);
  return () => { preferenceListeners.delete(listener); };
}

export function getSelectedCurrency() { return currentCurrency; }
export function getAppLanguage() { return currentLanguage; }

export function useSelectedCurrency() {
  return useSyncExternalStore(subscribe, getSelectedCurrency, () => 'INR' as CurrencyCode);
}

export function useAppLanguage() {
  return useSyncExternalStore(subscribe, getAppLanguage, () => 'English' as AppLanguage);
}

export function isCurrencyCode(value: string): value is CurrencyCode {
  return ['INR', 'USD', 'EUR', 'GBP', 'AED', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'IDR', 'JPY', 'MYR', 'NZD', 'SAR', 'SGD', 'THB', 'TRY', 'ZAR'].includes(value);
}

export function getAppLocale() {
  return `${currentLanguage === 'Hindi' ? 'hi' : 'en'}-${getDeviceRegion()}`;
}

export function getDeviceRegion() {
  const locale = Intl.DateTimeFormat().resolvedOptions().locale;
  return /[-_]([A-Z]{2})(?:[-_]|$)/.exec(locale)?.[1] ?? 'IN';
}

export function translate(value: string): string {
  return translateCopy(value, currentLanguage);
}

function validLocale() {
  return getAppLocale();
}

export function formatLocalizedDate(value: string | Date, options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }) {
  const date = value instanceof Date ? value : /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  try { return new Intl.DateTimeFormat(validLocale(), options).format(date); }
  catch { return new Intl.DateTimeFormat('en-IN', options).format(date); }
}

export function formatLocalizedTime(value: string | Date, options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  try { return new Intl.DateTimeFormat(getAppLocale(), options).format(date); }
  catch { return new Intl.DateTimeFormat('en-IN', options).format(date); }
}

export function formatLocalizedCurrency(amount: number, currency: string = currentCurrency, locale = validLocale()) {
  try { return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: currency === 'JPY' || currency === 'INR' ? 0 : 2 }).format(amount); }
  catch { return `${currency} ${new Intl.NumberFormat(locale).format(amount)}`; }
}

type RateCache = { date: string; rate: number; savedAt: number };
const rateMemory = new Map<string, RateCache>();
const rateRequests = new Map<string, Promise<RateCache | null>>();
const RATE_CACHE_MS = 6 * 60 * 60 * 1000;

/** Daily reference conversion for display only. Checkout must always charge the provider's original amount/currency. */
async function loadReferenceRate(base: string, quote: string): Promise<RateCache | null> {
  if (!/^[A-Z]{3}$/.test(base) || !/^[A-Z]{3}$/.test(quote)) return null;
  if (base === quote) return { date: new Date().toISOString().slice(0, 10), rate: 1, savedAt: Date.now() };
  const key = `lemontrip:fx:${base}:${quote}`;
  const memory = rateMemory.get(key);
  if (memory && Date.now() - memory.savedAt < RATE_CACHE_MS) return memory;
  try {
    const stored = await AsyncStorage.getItem(key);
    if (stored) {
      const cached = JSON.parse(stored) as RateCache;
      if (Number.isFinite(cached.rate) && cached.rate > 0 && Date.now() - cached.savedAt < RATE_CACHE_MS) {
        rateMemory.set(key, cached);
        return cached;
      }
    }
  } catch { /* Continue with a fresh quote. */ }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(`https://api.frankfurter.dev/v2/rate/${base.toLowerCase()}/${quote.toLowerCase()}`, { signal: controller.signal });
    if (!response.ok) return null;
    const data = await response.json() as { date?: unknown; base?: unknown; quote?: unknown; rate?: unknown };
    if (data.base !== base || data.quote !== quote || typeof data.date !== 'string' || typeof data.rate !== 'number' || !Number.isFinite(data.rate) || data.rate <= 0) return null;
    const result = { date: data.date, rate: data.rate, savedAt: Date.now() };
    rateMemory.set(key, result);
    void AsyncStorage.setItem(key, JSON.stringify(result)).catch(() => undefined);
    return result;
  } catch { return null; }
  finally { clearTimeout(timeout); }
}

export function getReferenceRate(base: string, quote: string): Promise<RateCache | null> {
  const key = `${base}:${quote}`;
  const existing = rateRequests.get(key);
  if (existing) return existing;
  const request = loadReferenceRate(base, quote).finally(() => rateRequests.delete(key));
  rateRequests.set(key, request);
  return request;
}

export async function convertReferenceAmount(amount: number, base: string, quote: string) {
  const result = await getReferenceRate(base, quote);
  return result ? { amount: amount * result.rate, currency: quote, rateDate: result.date, rate: result.rate } : null;
}
