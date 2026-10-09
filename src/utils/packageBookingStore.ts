import { useEffect, useState } from 'react';
import { addBooking } from '@/utils/bookingStore';
import type { TravelPackage } from '@/types/content';
import {
  computePackageFare, defaultRooms, departureDates, minRooms, parseDuration, parsePackagePrice, totalTravellers, tripEndDate, travellerType,
  MAX_GUESTS, type Counts, type PackageFare, type TravellerType,
} from '@/data/packages';

/* ---------- types ---------- */

/** Snapshot of the chosen package, so the flow never depends on the content API again. */
export interface PackageSnapshot {
  id: string; title: string; image: string; destination: string; duration: string;
  unitPrice: number; priceLabel: string; international: boolean;
  inclusions: string[]; hotels: string[]; cancellation?: string; terms?: string;
}
export interface PackageTravellerInput { name: string; age: string; gender: 'M' | 'F' | 'O' | '' }
export interface PackageContact { email: string; phone: string; passport: string; requests: string }
export interface PackagePayment { method: 'upi' | 'card' | 'netbanking' | 'wallet'; label: string }
export interface PackageTicketTraveller { name: string; age: number; gender: string; type: TravellerType }
export interface PackageTicket {
  bookingId: string; voucher: string; bookedAt: string;
  packageId: string; title: string; destination: string; image: string; duration: string; nights: number;
  startDate: string; endDate: string; counts: Counts; rooms: number;
  travellers: PackageTicketTraveller[]; contact: PackageContact;
  inclusions: string[]; hotels: string[]; cancellation?: string;
  fare: PackageFare; couponCode: string | null; payment: PackagePayment; txnId: string;
}

/* ---------- state ---------- */

interface State {
  pkg: PackageSnapshot | null;
  date: string;
  counts: Counts;
  rooms: number;
  travellers: PackageTravellerInput[];
  contact: PackageContact;
  coupon: { code: string; discount: number } | null;
  ticket: PackageTicket | null;
}

const blankTraveller = (): PackageTravellerInput => ({ name: '', age: '', gender: '' });
const blankContact = (): PackageContact => ({ email: '', phone: '', passport: '', requests: '' });
const initialCounts = (): Counts => ({ adults: 2, children: 0, infants: 0 });
const resize = (list: PackageTravellerInput[], size: number) => Array.from({ length: size }, (_, i) => list[i] ?? blankTraveller());

let state: State = {
  pkg: null, date: departureDates()[0], counts: initialCounts(), rooms: defaultRooms(initialCounts()),
  travellers: resize([], 2), contact: blankContact(), coupon: null, ticket: null,
};
let listeners: (() => void)[] = [];
const emit = () => listeners.forEach((l) => l());
function set(patch: Partial<State>) { state = { ...state, ...patch }; emit(); }

export const getPackageBooking = () => state;
export function usePackageBooking() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.push(l);
    return () => { listeners = listeners.filter((x) => x !== l); };
  }, []);
  return state;
}

/* ---------- actions ---------- */

/** Call from the details screen. Starting a different package resets dates and travellers; the same package keeps them. */
export function selectPackage(item: TravelPackage) {
  const pkg: PackageSnapshot = {
    id: item.id, title: item.title, image: item.image, destination: item.destination ?? item.title, duration: item.duration,
    unitPrice: parsePackagePrice(item.price), priceLabel: item.price,
    international: Boolean(item.categories?.includes('International')),
    inclusions: item.inclusions ?? [], hotels: item.hotels ?? [], cancellation: item.cancellation, terms: item.terms,
  };
  if (state.pkg?.id === pkg.id && !state.ticket) { set({ pkg }); return; }
  const counts = initialCounts();
  set({ pkg, date: departureDates()[0], counts, rooms: defaultRooms(counts), travellers: resize([], totalTravellers(counts)), coupon: null, ticket: null });
}

export const setDepartureDate = (date: string) => set({ date, coupon: null });

export function setCounts(patch: Partial<Counts>) {
  let { adults, children, infants } = { ...state.counts, ...patch };
  adults = Math.min(Math.max(adults, 1), MAX_GUESTS);
  children = Math.min(Math.max(children, 0), MAX_GUESTS - adults);
  infants = Math.min(Math.max(infants, 0), Math.min(adults, 4));
  const counts = { adults, children, infants };
  const rooms = Math.min(Math.max(state.rooms, minRooms(counts)), Math.max(adults, minRooms(counts)));
  set({ counts, rooms, travellers: resize(state.travellers, totalTravellers(counts)), coupon: null });
}
export const setRooms = (rooms: number) => set({ rooms: Math.min(Math.max(rooms, minRooms(state.counts)), Math.max(state.counts.adults, minRooms(state.counts))) });
export const updateTraveller = (index: number, patch: Partial<PackageTravellerInput>) => set({ travellers: state.travellers.map((t, i) => (i === index ? { ...t, ...patch } : t)) });
export const setContact = (patch: Partial<PackageContact>) => set({ contact: { ...state.contact, ...patch } });
export const setCoupon = (coupon: State['coupon']) => set({ coupon });

export function resetPackageBooking() {
  const counts = initialCounts();
  set({ pkg: null, date: departureDates()[0], counts, rooms: defaultRooms(counts), travellers: resize([], totalTravellers(counts)), coupon: null, ticket: null });
}

/* ---------- derived ---------- */

export function currentPackageFare(s: State = state): { fare: PackageFare; endDate: string; nights: number } | null {
  if (!s.pkg || s.pkg.unitPrice <= 0) return null;
  const fare = computePackageFare(s.pkg.unitPrice, s.counts, s.coupon?.discount ?? 0);
  return { fare, endDate: tripEndDate(s.date, s.pkg.duration), nights: parseDuration(s.pkg.duration).nights };
}

/* ---------- booking ---------- */

const rand = (len: number, chars = '0123456789') => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

/** Simulates a successful payment, issues a dummy voucher and records it in My Trips. */
export function confirmPackageBooking(payment: PackagePayment): PackageTicket | null {
  const derived = currentPackageFare();
  const pkg = state.pkg;
  if (!derived || !pkg) return null;
  const { fare, endDate, nights } = derived;
  const ticket: PackageTicket = {
    bookingId: `LT-PK-${rand(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789')}`, voucher: `PKG${rand(9)}`, bookedAt: new Date().toISOString(),
    packageId: pkg.id, title: pkg.title, destination: pkg.destination, image: pkg.image, duration: pkg.duration, nights,
    startDate: state.date, endDate, counts: { ...state.counts }, rooms: state.rooms,
    travellers: state.travellers.map((t, i) => ({ name: t.name.trim(), age: Number(t.age), gender: t.gender === 'M' ? 'Male' : t.gender === 'F' ? 'Female' : 'Other', type: travellerType(i, state.counts) })),
    contact: { ...state.contact, passport: state.contact.passport.trim().toUpperCase(), requests: state.contact.requests.trim() },
    inclusions: pkg.inclusions.slice(0, 6), hotels: pkg.hotels.slice(0, 3), cancellation: pkg.cancellation,
    fare, couponCode: state.coupon?.code ?? null, payment, txnId: `TXN${rand(12)}`,
  };
  addBooking({
    id: ticket.bookingId, serviceName: 'Holiday Package', itemName: `${pkg.title} · ${pkg.duration}`,
    price: `₹${fare.total.toLocaleString('en-IN')}`, bookedAt: ticket.bookedAt, tripDate: ticket.startDate, destination: pkg.destination, status: 'confirmed',
  });
  set({ ticket });
  return ticket;
}
