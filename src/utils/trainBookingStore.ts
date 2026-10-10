import { useEffect, useState } from 'react';
import { addBooking } from '@/utils/bookingStore';
import {
  COACH_PREFIX, CLASS_INFO, computeFare, defaultTravelDate, formatDuration, getAvailability, getStation, getTrain, addDaysISO,
  type ClassCode, type FareBreakdown, type Quota, type TrainResult,
} from '@/data/trains';

/* ---------- types ---------- */

export interface TrainSearch { from: string; to: string; date: string; classCode: ClassCode | 'ANY' }
export interface TrainPassengerInput { name: string; age: string; gender: 'M' | 'F' | 'O' | ''; berth: string }
export interface TrainContact { email: string; phone: string }
export interface TrainSelection { trainId: string; fromCode: string; toCode: string; date: string; classCode: ClassCode; quota: Quota }
export interface TrainOptions { autoUpgrade: boolean; confirmedOnly: boolean }
export interface TrainPayment { method: 'upi' | 'card' | 'netbanking' | 'wallet'; label: string }
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
  const changed = !state.selection || state.selection.trainId !== selection.trainId || state.selection.classCode !== selection.classCode;
  set({ selection, coupon: null, passengers: changed ? state.passengers.map((p) => ({ ...p, berth: 'No preference' })) : state.passengers });
}
export const updateSelection = (patch: Partial<TrainSelection>) => { if (state.selection) set({ selection: { ...state.selection, ...patch }, coupon: null }); };

export const setPassengers = (passengers: TrainPassengerInput[]) => set({ passengers });
export const addPassenger = () => { if (state.passengers.length < MAX_PASSENGERS) set({ passengers: [...state.passengers, blankPassenger()], coupon: null }); };
export const removePassenger = (index: number) => { if (state.passengers.length > 1) set({ passengers: state.passengers.filter((_, i) => i !== index), coupon: null }); };
export const updatePassenger = (index: number, patch: Partial<TrainPassengerInput>) => set({ passengers: state.passengers.map((p, i) => (i === index ? { ...p, ...patch } : p)) });
export const setContact = (patch: Partial<TrainContact>) => set({ contact: { ...state.contact, ...patch } });
export const setOptions = (patch: Partial<TrainOptions>) => set({ options: { ...state.options, ...patch } });
export const setCoupon = (coupon: State['coupon']) => set({ coupon });

export function resetTrainBooking() {
  set({ selection: null, passengers: [blankPassenger()], coupon: null, options: { autoUpgrade: true, confirmedOnly: false }, ticket: null });
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
export function confirmTrainBooking(payment: TrainPayment): TrainTicket | null {
  const derived = currentFare();
  const sel = state.selection;
  if (!derived || !sel) return null;
  const { fare, result } = derived;
  const availability = getAvailability(sel.trainId, sel.classCode, sel.date, sel.quota);
  const prefix = COACH_PREFIX[sel.classCode];
  const used = new Set<number>();
  const passengers: TicketPassenger[] = state.passengers.map((p, i) => {
    let seatNo = 1 + Math.floor(Math.random() * 60);
    while (used.has(seatNo)) seatNo = 1 + Math.floor(Math.random() * 60);
    used.add(seatNo);
    const waitlisted = availability.status === 'WL' && !state.options.confirmedOnly;
    const rac = availability.status === 'RAC';
    const status = waitlisted ? `WL/${availability.count + i}` : rac ? `RAC/${availability.count + i}` : 'CNF';
    const seat = waitlisted ? 'Waitlisted' : rac ? 'Sharing berth' : `${prefix}${1 + (i % 3)}/${seatNo}${p.berth !== 'No preference' ? ` · ${p.berth}` : ''}`;
    return { name: p.name.trim(), age: Number(p.age), gender: p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other', berth: p.berth, status, seat };
  });
  const pnr = rand(10);
  const ticket: TrainTicket = {
    pnr, bookingId: `LT-TR-${rand(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789')}`, bookedAt: new Date().toISOString(),
    trainId: result.train.id, trainName: result.train.name, trainNumber: result.train.number,
    fromCode: sel.fromCode, fromName: getStation(sel.fromCode)?.name ?? sel.fromCode, toCode: sel.toCode, toName: getStation(sel.toCode)?.name ?? sel.toCode,
    date: sel.date, arrivalDate: addDaysISO(sel.date, result.arrivalDayOffset), departure: result.departure, arrival: result.arrival, duration: formatDuration(result.durationMin),
    classCode: sel.classCode, className: CLASS_INFO[sel.classCode].name, quota: sel.quota,
    passengers, contact: { ...state.contact }, fare, couponCode: state.coupon?.code ?? null, payment, txnId: `TXN${rand(12)}`,
  };
  addBooking({
    id: ticket.bookingId, serviceName: 'Trains', itemName: `${ticket.trainName} (${ticket.trainNumber}) · ${ticket.fromCode} → ${ticket.toCode}`,
    price: `₹${fare.total.toLocaleString('en-IN')}`, bookedAt: ticket.bookedAt, tripDate: ticket.date, destination: ticket.toName, status: 'confirmed',
  });
  set({ ticket });
  return ticket;
}
