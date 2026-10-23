import { getAppLocale } from '@/utils/intl';
import { useEffect, useState } from 'react';
import { addBooking } from '@/utils/bookingStore';
import {
  COACH_PREFIX, CLASS_INFO, computeFare, defaultTravelDate, describeSeat, formatDuration, getAvailability, getBookedSeats, getCoachLayout, getStation, getTrain, addDaysISO,
  type ClassCode, type FareBreakdown, type Quota, type TrainResult,
} from '@/data/trains';

/* ---------- types ---------- */

export interface TrainSearch { from: string; to: string; date: string; classCode: ClassCode | 'ANY' }
export interface TrainPassengerInput { name: string; age: string; gender: 'M' | 'F' | 'O' | ''; berth: string }
export interface TrainContact { email: string; phone: string }
export interface TrainSelection { trainId: string; fromCode: string; toCode: string; date: string; classCode: ClassCode; quota: Quota }
export interface TrainOptions { autoUpgrade: boolean; confirmedOnly: boolean }
export interface TrainPayment { method: 'razorpay' | 'upi' | 'card' | 'netbanking' | 'wallet'; label: string }
export interface TicketPassenger { name: string; age: number; gender: string; berth: string; status: string; seat: string }
export interface TrainTicket {
  pnr: string; bookingId: string; bookedAt: string;
  trainId: string; trainName: string; trainNumber: string;
  fromCode: string; fromName: string; toCode: string; toName: string;
  date: string; arrivalDate: string; departure: string; arrival: string; duration: string;
  classCode: ClassCode; className: string; quota: Quota;
  passengers: TicketPassenger[]; contact: TrainContact;
  fare: FareBreakdown; couponCode: string | null; payment: TrainPayment; txnId: string;
}

/* ---------- state ---------- */

interface State {
  search: TrainSearch;
  selection: TrainSelection | null;
  passengers: TrainPassengerInput[];
  /** Seats/berths picked on the seat map, in passenger order (optional; the rest are auto-allotted). */
  seats: string[];
  contact: TrainContact;
  options: TrainOptions;
  coupon: { code: string; discount: number } | null;
  ticket: TrainTicket | null;
}

const blankPassenger = (): TrainPassengerInput => ({ name: '', age: '', gender: '', berth: 'No preference' });

let state: State = {
  search: { from: '', to: '', date: defaultTravelDate(), classCode: 'ANY' },
  selection: null,
  passengers: [blankPassenger()],
  seats: [],
  contact: { email: '', phone: '' },
  options: { autoUpgrade: true, confirmedOnly: false },
  coupon: null,
  ticket: null,
};
let listeners: (() => void)[] = [];
const emit = () => listeners.forEach((l) => l());
function set(patch: Partial<State>) { state = { ...state, ...patch }; emit(); }

export const getTrainBooking = () => state;
export function useTrainBooking() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.push(l);
    return () => { listeners = listeners.filter((x) => x !== l); };
  }, []);
  return state;
}

/* ---------- actions ---------- */

export const MAX_PASSENGERS = 6;

export const setTrainSearch = (patch: Partial<TrainSearch>) => set({ search: { ...state.search, ...patch } });

export function selectTrain(selection: TrainSelection) {
  const prev = state.selection;
  const changed = !prev || prev.trainId !== selection.trainId || prev.classCode !== selection.classCode;
  const seatsStale = changed || prev.date !== selection.date;
  set({ selection, coupon: null, seats: seatsStale ? [] : state.seats, passengers: changed ? state.passengers.map((p) => ({ ...p, berth: 'No preference' })) : state.passengers });
}
export const updateSelection = (patch: Partial<TrainSelection>) => {
  if (!state.selection) return;
  // A different class or quota changes the coach layout and availability, so earlier seat picks no longer apply.
  const seatsStale = (patch.classCode && patch.classCode !== state.selection.classCode) || (patch.quota && patch.quota !== state.selection.quota);
  set({ selection: { ...state.selection, ...patch }, coupon: null, ...(seatsStale ? { seats: [] } : {}) });
};

export const setPassengers = (passengers: TrainPassengerInput[]) => set({ passengers });
export const addPassenger = () => { if (state.passengers.length < MAX_PASSENGERS) set({ passengers: [...state.passengers, blankPassenger()], coupon: null }); };
export const removePassenger = (index: number) => {
  if (state.passengers.length <= 1) return;
  const passengers = state.passengers.filter((_, i) => i !== index);
  set({ passengers, seats: state.seats.slice(0, passengers.length), coupon: null });
};

/** Pick or drop a seat. Returns 'limit' when every passenger already has one. */
export function toggleSeat(id: string): 'ok' | 'limit' {
  if (state.seats.includes(id)) { set({ seats: state.seats.filter((x) => x !== id) }); return 'ok'; }
  if (state.seats.length >= state.passengers.length) return 'limit';
  set({ seats: [...state.seats, id] });
  return 'ok';
}
export const clearSeats = () => set({ seats: [] });

/** Seat selection only applies to confirmed (AVL) bookings; RAC/WL berths are allotted when the chart is prepared. */
export function seatSelectionOpen(s: State = state): boolean {
  const sel = s.selection;
  return !!sel && getAvailability(sel.trainId, sel.classCode, sel.date, sel.quota).status === 'AVL';
}
export const updatePassenger = (index: number, patch: Partial<TrainPassengerInput>) => set({ passengers: state.passengers.map((p, i) => (i === index ? { ...p, ...patch } : p)) });
export const setContact = (patch: Partial<TrainContact>) => set({ contact: { ...state.contact, ...patch } });
export const setOptions = (patch: Partial<TrainOptions>) => set({ options: { ...state.options, ...patch } });
export const setCoupon = (coupon: State['coupon']) => set({ coupon });

export function resetTrainBooking() {
  set({ selection: null, passengers: [blankPassenger()], seats: [], coupon: null, options: { autoUpgrade: true, confirmedOnly: false }, ticket: null });
}

/* ---------- derived ---------- */

export function currentFare(s: State = state): { fare: FareBreakdown; result: TrainResult } | null {
  const sel = s.selection;
  if (!sel) return null;
  const train = getTrain(sel.trainId);
  if (!train) return null;
  const a = train.route.find((x) => x.code === sel.fromCode); const b = train.route.find((x) => x.code === sel.toCode);
  if (!a || !b) return null;
  const result: TrainResult = { train, from: a, to: b, departure: a.dep ?? '', arrival: b.arr ?? '', arrivalDayOffset: b.day - a.day, durationMin: 0, distanceKm: b.km - a.km };
  const [dh, dm] = (a.dep ?? '00:00').split(':').map(Number); const [ah, am] = (b.arr ?? '00:00').split(':').map(Number);
  result.durationMin = (b.day * 1440 + ah * 60 + am) - (a.day * 1440 + dh * 60 + dm);
  const fare = computeFare(train, sel.classCode, result.distanceKm, sel.quota, s.passengers.length, s.coupon?.discount ?? 0);
  return { fare, result };
}

/* ---------- booking ---------- */

const rand = (len: number, chars = '0123456789') => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

/** Simulates a successful payment and issues a dummy e-ticket. Also records it in My Trips. */
export function confirmTrainBooking(payment: TrainPayment, gatewayPaymentId?: string): TrainTicket | null {
  const derived = currentFare();
  const sel = state.selection;
  if (!derived || !sel) return null;
  const { fare, result } = derived;
  const availability = getAvailability(sel.trainId, sel.classCode, sel.date, sel.quota);
  const prefix = COACH_PREFIX[sel.classCode];
  const chosen = availability.status === 'AVL' ? state.seats : [];
  // Auto-allot the remaining passengers from free seats in the first coach, preferring their berth choice.
  const coach = `${prefix}1`;
  const taken = new Set([...getBookedSeats(sel.trainId, sel.classCode, sel.date, coach), ...chosen]);
  const free = getCoachLayout(sel.classCode, coach).bays.flatMap((b) => [...b.rows.flat(), ...b.side]).filter((x): x is NonNullable<typeof x> => !!x && !taken.has(x.id));
  const passengers: TicketPassenger[] = state.passengers.map((p, i) => {
    const waitlisted = availability.status === 'WL' && !state.options.confirmedOnly;
    const rac = availability.status === 'RAC';
    const status = waitlisted ? `WL/${availability.count + i}` : rac ? `RAC/${availability.count + i}` : 'CNF';
    let seat = waitlisted ? 'Waitlisted' : rac ? 'Sharing berth' : '';
    if (!seat) {
      if (chosen[i]) seat = describeSeat(sel.classCode, chosen[i]);
      else {
        const at = Math.max(0, free.findIndex((x) => p.berth === 'No preference' || x.tier === p.berth));
        const [auto] = free.splice(at, 1);
        seat = auto ? `${auto.id} · ${auto.tier}` : `${coach}/${1 + i}`;
      }
    }
    return { name: p.name.trim(), age: Number(p.age), gender: p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other', berth: p.berth, status, seat };
  });
  const pnr = rand(10);
  const ticket: TrainTicket = {
    pnr, bookingId: `LT-TR-${rand(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789')}`, bookedAt: new Date().toISOString(),
    trainId: result.train.id, trainName: result.train.name, trainNumber: result.train.number,
    fromCode: sel.fromCode, fromName: getStation(sel.fromCode)?.name ?? sel.fromCode, toCode: sel.toCode, toName: getStation(sel.toCode)?.name ?? sel.toCode,
    date: sel.date, arrivalDate: addDaysISO(sel.date, result.arrivalDayOffset), departure: result.departure, arrival: result.arrival, duration: formatDuration(result.durationMin),
    classCode: sel.classCode, className: CLASS_INFO[sel.classCode].name, quota: sel.quota,
    passengers, contact: { ...state.contact }, fare, couponCode: state.coupon?.code ?? null, payment, txnId: gatewayPaymentId ?? `TXN${rand(12)}`,
  };
  addBooking({
    id: ticket.bookingId, serviceName: 'Trains', itemName: `${ticket.trainName} (${ticket.trainNumber}) · ${ticket.fromCode} → ${ticket.toCode}`,
    price: `₹${fare.total.toLocaleString(getAppLocale())}`, bookedAt: ticket.bookedAt, tripDate: ticket.date, destination: ticket.toName, status: 'confirmed',
  });
  set({ ticket });
  return ticket;
}