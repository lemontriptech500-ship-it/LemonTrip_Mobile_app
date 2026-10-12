import { formatLocalizedCurrency, formatLocalizedTime } from '@/utils/intl';

export function formatPrice(amount: number, currency: string) {
  return formatLocalizedCurrency(amount, currency);
}

// 06:15 for "2026-12-01T06:15:00" (local) or any ISO timestamp; other formats are left untouched.
export function formatTime(value: string) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime()) && /T/.test(value)) return formatLocalizedTime(parsed, { hour: '2-digit', minute: '2-digit' });
  const match = /T(\d{2}:\d{2})/.exec(value);
  return match ? match[1] : value;
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h${rest ? ` ${rest}m` : ''}`;
}
