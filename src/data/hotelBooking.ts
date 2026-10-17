import type { Hotel, HotelRoomOption } from '@/types/content';

// Shared helpers (currency, dates, demo wallet, banks) come from the train data module,
// exactly like the bus flow, so every booking journey formats things the same way.
export { inr, formatLongDate, formatShortDate, addDaysISO, WALLET_BALANCE, BANKS } from '@/data/trains';

export const CHECK_IN_TIME = '2:00 PM';
export const CHECK_OUT_TIME = '11:00 AM';
export const MAX_GUESTS = 12;
export const MAX_ROOMS = 6;

export const TITLES = ['Mr', 'Ms', 'Mrs'] as const;
export const ARRIVAL_SLOTS = ['Before 12 PM', '12 – 4 PM', '4 – 8 PM', 'After 8 PM'];
export const BED_PREFERENCES = ['No preference', 'King bed', 'Twin beds', 'High floor', 'Quiet room', 'Non-smoking'];

/* ---------- parsing ---------- */

export const parsePrice = (price?: string): number | null => {
  const match = price?.match(/[\d,]+(?:\.\d+)?/);
  return match ? Number(match[0].replace(/,/g, '')) : null;
};

export function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const nights = Math.round((end.getTime() - start.getTime()) / 86400000);
  return nights > 0 ? nights : 0;
}

/** Rooms for a hotel; falls back to a single "Standard room" priced at the hotel's headline rate. */
export function getRoomOptions(hotel: Hotel): HotelRoomOption[] {
  if (hotel.roomOptions?.length) return hotel.roomOptions;
  return [{ id: 'standard-room', name: 'Standard room', pricePerNight: hotel.price, amenities: [], breakfast: hotel.breakfast, cancellation: hotel.cancellation }];
}

export function cancellationInfo(room: HotelRoomOption | undefined, hotel: Hotel) {
  const text = room?.cancellation ?? hotel.cancellation;
  if (!text) return { text: 'Cancellation policy not specified for this stay.', free: false };
  return { text, free: /free|flexible/i.test(text) };
}

/* ---------- fare ---------- */

export interface HotelFare {
  nightly: number; nights: number; rooms: number;
  base: number; taxRate: number; taxes: number; convenience: number;
  subtotal: number; discount: number; total: number;
}

/** Demo pricing: GST 5% up to ₹7,500 per room per night, 18% above, plus a flat convenience fee. */
export function computeHotelFare(nightly: number, nights: number, rooms: number, discount = 0): HotelFare {
  const base = nightly * nights * rooms;
  const taxRate = nightly > 7500 ? 0.18 : 0.05;
  const taxes = Math.round(base * taxRate);
  const convenience = 99;
  const subtotal = base + taxes + convenience;
  return { nightly, nights, rooms, base, taxRate, taxes, convenience, subtotal, discount, total: Math.max(0, subtotal - discount) };
}

/* ---------- coupons ---------- */

export interface HotelCoupon { code: string; label: string; min: number; compute: (amount: number) => number }
export const HOTEL_COUPONS: HotelCoupon[] = [
  { code: 'LEMON10', label: '10% off up to ₹750', min: 2000, compute: (a) => Math.min(750, Math.round(a * 0.1)) },
  { code: 'STAY500', label: 'Flat ₹500 off', min: 4000, compute: () => 500 },
  { code: 'FIRSTSTAY', label: '15% off up to ₹1,500', min: 6000, compute: (a) => Math.min(1500, Math.round(a * 0.15)) },
];

export function validateHotelCoupon(code: string, amount: number): { ok: true; coupon: HotelCoupon; discount: number } | { ok: false; error: string } {
  const coupon = HOTEL_COUPONS.find((c) => c.code === code.trim().toUpperCase());
  if (!coupon) return { ok: false, error: 'This coupon code is not valid.' };
  if (amount < coupon.min) return { ok: false, error: `Add ₹${coupon.min - Math.round(amount)} more to use ${coupon.code}.` };
  return { ok: true, coupon, discount: coupon.compute(amount) };
}
