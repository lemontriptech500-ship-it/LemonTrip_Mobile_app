import { useEffect, useState } from 'react';
import { addBooking } from '@/utils/bookingStore';
import {
  DEFAULT_BOARDING, DEFAULT_DROPPING, computeFare, defaultTravelDate, formatDuration, addDaysISO, getBoardingPoints, getBus, getCity, getDroppingPoints, shiftTime,
  type Bus, type FareBreakdown,
} from '@/data/buses';

/* ---------- types ---------- */

export interface BusSearch { from: string; to: string; date: string }
export interface BusSelection { busId: string; fromCode: string; toCode: string; date: string; seats: string[]; boardingId: string; droppingId: string }
export interface BusPassengerInput { name: string; age: string; gender: 'M' | 'F' | 'O' | '' }
export interface BusContact { email: string; phone: string }
export interface BusOptions { insurance: boolean; delayAlerts: boolean }
export interface BusPayment { method: 'upi' | 'card' | 'netbanking' | 'wallet'; label: string }
export interface TicketPassenger { name: string; age: number; gender: string; seat: string }
export interface TicketPoint { name: string; landmark: string; time: string }
export interface BusTicket {
  ticketNo: string; bookingId: string; bookedAt: string;
  busId: string; operator: string; busType: string; ac: boolean;
  fromCode: string; fromName: string; toCode: string; toName: string;
  date: string; arrivalDate: string; departure: string; arrival: string; duration: string;
  boarding: TicketPoint; dropping: TicketPoint;
  passengers: TicketPassenger[]; contact: BusContact; insurance: boolean;
  fare: FareBreakdown; couponCode: string | null; payment: BusPayment; txnId: string;
}

/* ---------- state ---------- */

interface State {
  search: BusSearch;
  selection: BusSelection | null;
  passengers: BusPassengerInput[];
  contact: BusContact;
  options: BusOptions;
  coupon: { code: string; discount: number } | null;
  ticket: BusTicket | null;
}

export const MAX_SEATS = 6;
const blankPassenger = (): BusPassengerInput => ({ name: '', age: '', gender: '' });
const defaultOptions = (): BusOptions => ({ insurance: false, delayAlerts: true });

let state: State = {
  search: { from: '', to: '', date: defaultTravelDate() },
  selection: null,
  passengers: [],
  contact: { email: '', phone: '' },
  options: defaultOptions(),
  coupon: null,
  ticket: null,
};
let listeners: (() => void)[] = [];
const emit = () => listeners.forEach((l) => l());
function set(patch: Partial<State>) { state = { ...state, ...patch }; emit(); }

export const getBusBooking = () => state;
export function useBusBooking() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.push(l);
    return () => { listeners = listeners.filter((x) => x !== l); };
  }, []);
  return state;
}

/* ---------- actions ---------- */

export const setBusSearch = (patch: Partial<BusSearch>) => set({ search: { ...state.search, ...patch } });

/** Starts (or resumes) a selection. Seats are kept only when the bus and date are unchanged. */
export function selectBus(next: Omit<BusSelection, 'seats' | 'boardingId' | 'droppingId'> & Partial<Pick<BusSelection, 'seats' | 'boardingId' | 'droppingId'>>) {
  const prev = state.selection;
  const same = !!prev && prev.busId === next.busId && prev.date === next.date;
  const seats = next.seats ?? (same ? prev!.seats : []);
  set({
    selection: { ...next, seats, boardingId: next.boardingId ?? (same ? prev!.boardingId : DEFAULT_BOARDING), droppingId: next.droppingId ?? (same ? prev!.droppingId : DEFAULT_DROPPING) },
    passengers: same ? state.passengers : seats.map(blankPassenger),
    coupon: same ? state.coupon : null,
  });
}

/** Keeps one passenger row per seat, preserving anything already typed. */
function syncPassengers(seats: string[]) {
  return seats.map((_, i) => state.passengers[i] ?? blankPassenger());
}

export function toggleSeat(seat: string): 'ok' | 'limit' {
  const sel = state.selection;
  if (!sel) return 'ok';
  const has = sel.seats.includes(seat);
  if (!has && sel.seats.length >= MAX_SEATS) return 'limit';
  const seats = has ? sel.seats.filter((s) => s !== seat) : [...sel.seats, seat];
  set({ selection: { ...sel, seats }, passengers: syncPassengers(seats), coupon: null });
  return 'ok';
}
export const clearSeats = () => { if (state.selection) set({ selection: { ...state.selection, seats: [] }, passengers: [], coupon: null }); };
export const setBoarding = (boardingId: string) => { if (state.selection) set({ selection: { ...state.selection, boardingId } }); };
export const setDropping = (droppingId: string) => { if (state.selection) set({ selection: { ...state.selection, droppingId } }); };

export const updatePassenger = (index: number, patch: Partial<BusPassengerInput>) => set({ passengers: state.passengers.map((p, i) => (i === index ? { ...p, ...patch } : p)) });
export const setContact = (patch: Partial<BusContact>) => set({ contact: { ...state.contact, ...patch } });
export const setOptions = (patch: Partial<BusOptions>) => set({ options: { ...state.options, ...patch }, coupon: null });
export const setCoupon = (coupon: State['coupon']) => set({ coupon });

export function resetBusBooking() {
  set({ selection: null, passengers: [], coupon: null, options: defaultOptions(), ticket: null });
}

/* ---------- derived ---------- */

export function currentFare(s: State = state): { fare: FareBreakdown; bus: Bus } | null {
  const sel = s.selection;
  if (!sel) return null;
  const bus = getBus(sel.busId);
  if (!bus) return null;
  return { fare: computeFare(bus, sel.seats, s.options.insurance, s.coupon?.discount ?? 0), bus };
}

/** Resolves the chosen boarding / dropping points with their clock times for the selected bus. */
export function currentPoints(s: State = state) {
  const sel = s.selection;
  const bus = sel ? getBus(sel.busId) : undefined;
  if (!sel || !bus) return null;
  const boarding = getBoardingPoints(bus).find((p) => p.id === sel.boardingId) ?? getBoardingPoints(bus)[0];
  const dropping = getDroppingPoints(bus).find((p) => p.id === sel.droppingId) ?? getDroppingPoints(bus)[0];
  const board = shiftTime(bus.departure, boarding.offsetMin);
  const drop = shiftTime(bus.arrival, dropping.offsetMin);
  return {
    boarding: { ...boarding, time: board.time },
    dropping: { ...dropping, time: drop.time, dayOffset: bus.arrivalDayOffset + drop.dayOffset },
  };
}

/* ---------- booking ---------- */

const rand = (len: number, chars = '0123456789') => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

/** Simulates a successful payment and issues a dummy e-ticket. Also records it in My Trips. */
export function confirmBusBooking(payment: BusPayment): BusTicket | null {
  const derived = currentFare();
  const sel = state.selection;
  const points = currentPoints();
  if (!derived || !sel || !points || !sel.seats.length || state.passengers.length !== sel.seats.length) return null;
  const { fare, bus } = derived;
  const passengers: TicketPassenger[] = state.passengers.map((p, i) => ({
    name: p.name.trim(), age: Number(p.age), gender: p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other', seat: sel.seats[i],
  }));
  const from = getCity(sel.fromCode); const to = getCity(sel.toCode);
  const ticket: BusTicket = {
    ticketNo: `LTB${rand(8)}`, bookingId: `LT-BS-${rand(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789')}`, bookedAt: new Date().toISOString(),
    busId: bus.id, operator: bus.operator, busType: bus.type, ac: bus.ac,
    fromCode: sel.fromCode, fromName: from?.name ?? sel.fromCode, toCode: sel.toCode, toName: to?.name ?? sel.toCode,
    date: sel.date, arrivalDate: addDaysISO(sel.date, points.dropping.dayOffset), departure: bus.departure, arrival: bus.arrival, duration: formatDuration(bus.durationMin),
    boarding: { name: points.boarding.name, landmark: points.boarding.landmark, time: points.boarding.time },
    dropping: { name: points.dropping.name, landmark: points.dropping.landmark, time: points.dropping.time },
    passengers, contact: { ...state.contact }, insurance: state.options.insurance,
    fare, couponCode: state.coupon?.code ?? null, payment, txnId: `TXN${rand(12)}`,
  };
  addBooking({
    id: ticket.bookingId, serviceName: 'Buses', itemName: `${ticket.operator} · ${ticket.fromName} → ${ticket.toName} · Seats ${sel.seats.join(', ')}`,
    price: `₹${fare.total.toLocaleString('en-IN')}`, bookedAt: ticket.bookedAt, tripDate: ticket.date, destination: ticket.toName, status: 'confirmed',
  });
  set({ ticket });
  return ticket;
}
