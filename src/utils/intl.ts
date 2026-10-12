import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export type AppLanguage = 'English' | 'Hindi';
export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'AUD' | 'CAD' | 'CHF' | 'CNY' | 'HKD' | 'IDR' | 'JPY' | 'MYR' | 'NZD' | 'SAR' | 'SGD' | 'THB' | 'TRY' | 'ZAR';

let currentLanguage: AppLanguage = 'English';
let currentCurrency: CurrencyCode = 'INR';
const preferenceListeners = new Set<() => void>();

export function setIntlPreferences(language: string, currency: string) {
  currentLanguage = language === 'Hindi' ? 'Hindi' : 'English';
  currentCurrency = isCurrencyCode(currency) ? currency : 'INR';
  preferenceListeners.forEach((listener) => listener());
}

export function getSelectedCurrency() { return currentCurrency; }

export function useSelectedCurrency() {
  const [currency, setCurrency] = useState(currentCurrency);
  useEffect(() => {
    const listener = () => setCurrency(currentCurrency);
    preferenceListeners.add(listener);
    listener();
    return () => { preferenceListeners.delete(listener); };
  }, []);
  return currency;
}

export function useAppLanguage() {
  const [, setVersion] = useState(0);
  useEffect(() => {
    const listener = () => setVersion((value) => value + 1);
    preferenceListeners.add(listener);
    return () => { preferenceListeners.delete(listener); };
  }, []);
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

const hindi: Record<string, string> = {
  Home: 'होम', Explore: 'खोजें', 'My Trips': 'मेरी यात्राएँ', Wallet: 'वॉलेट', Profile: 'प्रोफ़ाइल',
  Flights: 'उड़ानें', Hotels: 'होटल', Trains: 'ट्रेन', Buses: 'बसें', Holidays: 'छुट्टियाँ', Visa: 'वीज़ा',
  'Display language': 'ऐप की भाषा', 'Preferred currency': 'पसंदीदा मुद्रा', Personalise: 'अपनी पसंद चुनें',
  English: 'अंग्रेज़ी', Hindi: 'हिन्दी', 'Your account': 'आपका खाता', 'Saved travellers': 'सहेजे गए यात्री',
  'Saved searches': 'सहेजी गई खोजें', 'Recent searches': 'हाल की खोजें', Notifications: 'सूचनाएँ',
  'Notification settings': 'सूचना सेटिंग', Security: 'सुरक्षा', 'Edit profile': 'प्रोफ़ाइल संपादित करें',
  'Personal information': 'व्यक्तिगत जानकारी', 'About LemonTrip': 'LemonTrip के बारे में',
  'Choose your updates': 'अपनी सूचनाएँ चुनें', 'Booking updates': 'बुकिंग अपडेट', 'Offers and inspiration': 'ऑफ़र और सुझाव',
  'Email updates': 'ईमेल अपडेट', 'Your trips': 'आपकी यात्राएँ', Search: 'खोजें', Cancel: 'रद्द करें', Save: 'सहेजें',
  'Indicative rate': 'संकेतात्मक दर',
};

export function translate(value: string): string {
  return currentLanguage === 'Hindi' ? (hindi[value] ?? value) : value;
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
