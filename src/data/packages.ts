import { addDaysISO, fromISO, toISO } from '@/data/trains';

export { BANKS, WALLET_BALANCE, addDaysISO, formatLongDate, formatShortDate, inr } from '@/data/trains';

/* ---------- parsing helpers (the API returns display strings) ---------- */

/** "₹12,999", "From INR 129,900 (Sample)" -> 12999 / 129900. Returns 0 when no number is present. */
export function parsePackagePrice(price: string): number {
  const match = /\d[\d,]*(?:\.\d+)?/.exec(price ?? '');
  return match ? Math.round(Number(match[0].replace(/,/g, ''))) || 0 : 0;
}

/** "5 Nights / 6 Days", "6D/5N", "3 Days" -> { nights, days } */
export function parseDuration(duration: string): { nights: number; days: number } {
  const n = /(\d+)\s*n/i.exec(duration ?? '');
  const d = /(\d+)\s*d/i.exec(duration ?? '');
  const days = d ? Number(d[1]) : n ? Number(n[1]) + 1 : 1;
  const nights = n ? Number(n[1]) : Math.max(days - 1, 0);
  return { nights, days };
}

export const tripEndDate = (startISO: string, duration: string) => addDaysISO(startISO, Math.max(parseDuration(duration).days - 1, 0));

/* ---------- departures ---------- */

/** Bookable departure dates: starts 10 days out, every 2 days. */
export function departureDates(count = 12): string[] {
  const base = new Date(); base.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => { const d = new Date(base); d.setDate(base.getDate() + 10 + i * 2); return toISO(d); });
}

/** Deterministic demo seat availability so the same date always shows the same number. */
export function seatsLeft(packageId: string, date: string): number {
  let h = 7;
  for (const ch of `${packageId}${date}`) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (h % 13) + 2;
}

export const isValidDeparture = (date: string) => departureDates().includes(date) && !Number.isNaN(fromISO(date).getTime());

/* ---------- travellers ---------- */

export interface Counts { adults: number; children: number; infants: number }
export type TravellerType = 'Adult' | 'Child' | 'Infant';
export const MAX_GUESTS = 9; // adults + children
export const travellerType = (index: number, c: Counts): TravellerType => (index < c.adults ? 'Adult' : index < c.adults + c.children ? 'Child' : 'Infant');
export const totalTravellers = (c: Counts) => c.adults + c.children + c.infants;
export const minRooms = (c: Counts) => Math.max(1, Math.ceil((c.adults + c.children) / 3));
export const defaultRooms = (c: Counts) => Math.max(minRooms(c), Math.ceil(c.adults / 2));
export const AGE_RANGE: Record<TravellerType, [number, number]> = { Adult: [12, 120], Child: [2, 11], Infant: [0, 1] };

export const countsLabel = (c: Counts) =>
  [`${c.adults} adult${c.adults > 1 ? 's' : ''}`, c.children ? `${c.children} child${c.children > 1 ? 'ren' : ''}` : '', c.infants ? `${c.infants} infant${c.infants > 1 ? 's' : ''}` : ''].filter(Boolean).join(', ');

/* ---------- fare ---------- */

export interface PackageFare {
  unit: number; childUnit: number; counts: Counts;
  adultTotal: number; childTotal: number; base: number; gst: number; convenience: number;
  subtotal: number; discount: number; total: number;
}
export const CHILD_RATE = 0.75; // children (2-11) pay 75%, infants travel free
const GST_RATE = 0.05;
const CONVENIENCE_FEE = 299;

export function computePackageFare(unit: number, counts: Counts, discount = 0): PackageFare {
  const childUnit = Math.round(unit * CHILD_RATE);
  const adultTotal = unit * counts.adults;
  const childTotal = childUnit * counts.children;
  const base = adultTotal + childTotal;
  const gst = Math.round(base * GST_RATE);
  const subtotal = base + gst + CONVENIENCE_FEE;
  return { unit, childUnit, counts, adultTotal, childTotal, base, gst, convenience: CONVENIENCE_FEE, subtotal, discount, total: Math.max(0, subtotal - discount) };
}

/* ---------- coupons ---------- */

export interface PackageCoupon { code: string; label: string; min: number; compute: (amount: number) => number }
export const PACKAGE_COUPONS: PackageCoupon[] = [
  { code: 'HOLIDAY10', label: '10% off up to ₹3,000', min: 15000, compute: (a) => Math.min(3000, Math.round(a * 0.1)) },
  { code: 'LEMONFIRST', label: '5% off up to ₹1,500', min: 8000, compute: (a) => Math.min(1500, Math.round(a * 0.05)) },
  { code: 'TRIP2000', label: 'Flat ₹2,000 off', min: 30000, compute: () => 2000 },
];

export function validatePackageCoupon(code: string, amount: number): { ok: true; coupon: PackageCoupon; discount: number } | { ok: false; error: string } {
  const coupon = PACKAGE_COUPONS.find((c) => c.code === code.trim().toUpperCase());
  if (!coupon) return { ok: false, error: 'This coupon code is not valid.' };
  if (amount < coupon.min) return { ok: false, error: `Add ₹${(coupon.min - Math.round(amount)).toLocaleString('en-IN')} more to use ${coupon.code}.` };
  return { ok: true, coupon, discount: coupon.compute(amount) };
}
