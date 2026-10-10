export function formatPrice(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-IN')}`;
  }
}

// 06:15 for "2026-12-01T06:15:00" (local) or any ISO timestamp; other formats are left untouched.
export function formatTime(value: string) {
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime()) && /T/.test(value)) return parsed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
  const match = /T(\d{2}:\d{2})/.exec(value);
  return match ? match[1] : value;
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h${rest ? ` ${rest}m` : ''}`;
}
