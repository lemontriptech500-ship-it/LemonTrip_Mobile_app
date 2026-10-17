import { getAppLocale } from '@/utils/intl';
import { getFlightSelection } from '@/components/flights/flightSelectionStore';
import type { FlightSelection } from '@/components/flights/types';
import { addBooking } from '@/utils/bookingStore';
import type { VerifiedBookingPayment } from '@/utils/bookingPaymentApi';

export type Gender = 'Male' | 'Female' | 'Other' | '';

export type TravellerInfo = {
  firstName: string;
  lastName: string;
  gender: Gender;
  dob: string;
};

export type FlightAddOns = {
  baggage: boolean;
  meal: boolean;
  insurance: boolean;
};

export type FlightPayment = {
  method: 'razorpay' | 'upi' | 'card' | 'netbanking' | 'wallet';
  label: string;
};

export type FlightTicket = {
  pnr: string;
  bookingId: string;
  bookedAt: string;
  txnId: string;
  airline: string;
  flightNumber: string;
  fromCode: string;
  toCode: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  fareName: string;
  travellers: TravellerInfo[];
  seats: string[];
  addOns: string[];
  contactEmail: string;
  contactPhone: string;
  currency: string;
  fareTotal: number;
  seatTotal: number;
  addOnTotal: number;
  discount: number;
  couponCode: string | null;
  total: number;
  payment: FlightPayment;
};

export type FlightBookingDraft = {
  travellers: TravellerInfo[];
  contactEmail: string;
  contactPhone: string;
  seats: string[];
  addOns: FlightAddOns;
  seatTotal: number;
  addOnTotal: number;
  couponCode: string | null;
  /** Offer this draft belongs to, so seats/add-ons/coupon never leak into another flight. */
  offerId: string | null;
  ticket: FlightTicket | null;
};

const emptyDraft = (): FlightBookingDraft => ({
  travellers: [],
  contactEmail: '',
  contactPhone: '',
  seats: [],
  addOns: { baggage: false, meal: false, insurance: false },
  seatTotal: 0,
  addOnTotal: 0,
  couponCode: null,
  offerId: null,
  ticket: null,
});

// In-memory draft for the flight booking flow (same pattern as flightSelectionStore).
let draft: FlightBookingDraft = emptyDraft();

export function getFlightBookingDraft(): FlightBookingDraft {
  return draft;
}

export function updateFlightBookingDraft(patch: Partial<FlightBookingDraft>) {
  draft = { ...draft, ...patch };
}

export function resetFlightBookingDraft() {
  draft = emptyDraft();
}

/** Call when the guest continues from flight details. Keeps travellers/contact, drops stale seats, add-ons and coupon. */
export function beginFlightBooking(offerId: string) {
  if (draft.offerId === offerId && !draft.ticket) return;
  draft = { ...emptyDraft(), travellers: draft.travellers, contactEmail: draft.contactEmail, contactPhone: draft.contactPhone, offerId };
}

/* ---------- coupons (INR fares only) ---------- */

export interface FlightCoupon { code: string; label: string; min: number; compute: (amount: number) => number }
export const FLIGHT_COUPONS: FlightCoupon[] = [
  { code: 'FLY300', label: 'Flat ₹300 off', min: 3000, compute: () => 300 },
  { code: 'SKY5', label: '5% off up to ₹500', min: 2000, compute: (a) => Math.min(500, Math.round(a * 0.05)) },
  { code: 'FIRSTFLY', label: '8% off up to ₹1,000', min: 6000, compute: (a) => Math.min(1000, Math.round(a * 0.08)) },
];

export function validateFlightCoupon(code: string, amount: number): { ok: true; coupon: FlightCoupon; discount: number } | { ok: false; error: string } {
  const coupon = FLIGHT_COUPONS.find((c) => c.code === code.trim().toUpperCase());
  if (!coupon) return { ok: false, error: 'This coupon code is not valid.' };
  if (amount < coupon.min) return { ok: false, error: `Add ₹${coupon.min - Math.round(amount)} more to use ${coupon.code}.` };
  return { ok: true, coupon, discount: coupon.compute(amount) };
}

/** Single source of truth for what the guest pays; used by review, payment and confirmation. */
export function computeFlightTotals(selection: FlightSelection | null = getFlightSelection(), d: FlightBookingDraft = draft) {
  if (!selection) return null;
  const { offer, fareOption, request } = selection;
  const fare = fareOption ?? offer.fareOptions?.[0];
  const currency = fare ? fare.price.currency : offer.price.currency;
  const fareTotal = fare ? fare.price.total : offer.price.amount;
  const subtotal = fareTotal + d.seatTotal + d.addOnTotal;
  const result = currency === 'INR' && d.couponCode ? validateFlightCoupon(d.couponCode, subtotal) : null;
  const discount = result && result.ok ? result.discount : 0;
  return { offer, fare, request, currency, fareTotal, seatTotal: d.seatTotal, addOnTotal: d.addOnTotal, subtotal, discount, total: Math.max(0, subtotal - discount), couponCode: discount ? d.couponCode : null };
}

const rand = (len: number, chars = '0123456789') =>
  Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat(getAppLocale(), { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString(getAppLocale())}`;
  }
}

/** Simulates a successful payment, issues a demo e-ticket and records it in My Trips. */
export function confirmFlightBooking(payment: FlightPayment, verified?: VerifiedBookingPayment): FlightTicket | null {
  const totals = computeFlightTotals();
  if (!totals) return null;

  const { offer, fare, request, currency, fareTotal, total, discount, couponCode } = totals;

  const addOns: string[] = [];
  if (draft.addOns.baggage) addOns.push('Extra baggage');
  if (draft.addOns.meal) addOns.push('In-flight meal');
  if (draft.addOns.insurance) addOns.push('Travel insurance');

  const ticket: FlightTicket = {
    pnr: rand(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'),
    bookingId: verified?.bookingId ?? `LT-FL-${rand(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789')}`,
    bookedAt: new Date().toISOString(),
    txnId: verified?.paymentId ?? `TXN${rand(12)}`,
    airline: offer.airline.name,
    flightNumber: offer.flightNumber,
    fromCode: offer.departure.airportCode,
    toCode: offer.arrival.airportCode,
    date: request.departureDate,
    departureTime: offer.departure.time,
    arrivalTime: offer.arrival.time,
    durationMinutes: offer.durationMinutes,
    stops: offer.stops,
    fareName: fare?.name ?? 'Standard',
    travellers: draft.travellers,
    seats: draft.seats,
    addOns,
    contactEmail: draft.contactEmail,
    contactPhone: draft.contactPhone,
    currency,
    fareTotal,
    seatTotal: draft.seatTotal,
    addOnTotal: draft.addOnTotal,
    discount,
    couponCode,
    total,
    payment,
  };

  addBooking({
    id: ticket.bookingId,
    serviceName: 'Flights',
    itemName: `${ticket.airline} ${ticket.flightNumber} - ${ticket.fromCode} to ${ticket.toCode}`,
    price: money(total, currency),
    bookedAt: ticket.bookedAt,
    tripDate: ticket.date,
    destination: ticket.toCode,
    status: 'confirmed',
  });

  draft = { ...draft, ticket };
  return ticket;
}