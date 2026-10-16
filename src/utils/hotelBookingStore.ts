import { getAppLocale } from '@/utils/intl';
import { useEffect, useState } from 'react';
import { addBooking } from '@/utils/bookingStore';
import type { HotelSearchCriteria } from '@/utils/hotelSearchStore';
import type { Hotel, HotelRoomOption } from '@/types/content';
import {
  CHECK_IN_TIME, CHECK_OUT_TIME, MAX_GUESTS, MAX_ROOMS, cancellationInfo, computeHotelFare, getRoomOptions, nightsBetween, parsePrice,
  type HotelFare,
} from '@/data/hotelBooking';

/* ---------- types ---------- */

export interface HotelSelection { hotel: Hotel; roomId: string; checkIn: string; checkOut: string; guests: number; rooms: number }
export interface HotelContact { email: string; phone: string }
export interface HotelRequests { bed: string; arrival: string; note: string; earlyCheckIn: boolean; lateCheckOut: boolean }
export interface HotelPayment { method: 'upi' | 'card' | 'netbanking' | 'wallet'; label: string }
export interface VoucherGuest { name: string; lead: boolean }
export interface HotelVoucher {
  confirmationNo: string; bookingId: string; bookedAt: string;
  hotelId: string; hotelName: string; image: string; address: string; location: string;
  roomName: string; breakfast: boolean; cancellation: { text: string; free: boolean };
  checkIn: string; checkOut: string; checkInTime: string; checkOutTime: string; nights: number; rooms: number;
  guests: VoucherGuest[]; contact: HotelContact; requests: HotelRequests;
  fare: HotelFare; couponCode: string | null; payment: HotelPayment; txnId: string;
}

/* ---------- state ---------- */

interface State {
  selection: HotelSelection | null;
  leadTitle: string;
  guestNames: string[]; // index 0 = lead guest
  contact: HotelContact;
  requests: HotelRequests;
  coupon: { code: string; discount: number } | null;
  voucher: HotelVoucher | null;
}

const blankRequests = (): HotelRequests => ({ bed: 'No preference', arrival: '', note: '', earlyCheckIn: false, lateCheckOut: false });
const resize = (names: string[], count: number) => Array.from({ length: Math.max(1, count) }, (_, i) => names[i] ?? '');

let state: State = { selection: null, leadTitle: '', guestNames: [''], contact: { email: '', phone: '' }, requests: blankRequests(), coupon: null, voucher: null };
let listeners: (() => void)[] = [];
const emit = () => listeners.forEach((l) => l());
function set(patch: Partial<State>) { state = { ...state, ...patch }; emit(); }

export const getHotelBooking = () => state;
export function useHotelBooking() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.push(l);
    return () => { listeners = listeners.filter((x) => x !== l); };
  }, []);
  return state;
}

/* ---------- actions ---------- */

/** Starts (or resumes) a booking for a hotel using the criteria from the search screen. */
export function startHotelBooking(hotel: Hotel, search: HotelSearchCriteria, roomId?: string) {
  const rooms = getRoomOptions(hotel);
  const chosen = rooms.find((r) => r.id === roomId) ?? rooms[0];
  const prev = state.selection;
  const same = prev && prev.hotel.id === hotel.id && prev.checkIn === search.checkIn && prev.checkOut === search.checkOut;
  const guests = Math.min(MAX_GUESTS, Math.max(1, search.guests));
  const roomCount = Math.min(MAX_ROOMS, guests, Math.max(1, search.rooms));
  const selection: HotelSelection = { hotel, roomId: chosen.id, checkIn: search.checkIn, checkOut: search.checkOut, guests, rooms: roomCount };
  set({ selection, guestNames: resize(state.guestNames, guests), coupon: same && prev?.roomId === chosen.id ? state.coupon : null });
}

export function updateSelection(patch: Partial<Pick<HotelSelection, 'roomId' | 'guests' | 'rooms'>>) {
  const sel = state.selection;
  if (!sel) return;
  let guests = patch.guests ?? sel.guests;
  let rooms = patch.rooms ?? sel.rooms;
  guests = Math.min(MAX_GUESTS, Math.max(1, guests));
  rooms = Math.min(MAX_ROOMS, Math.max(1, rooms));
  // Every room needs at least one guest.
  if (rooms > guests) { if (patch.rooms !== undefined) guests = rooms; else rooms = guests; }
  set({ selection: { ...sel, ...patch, guests, rooms }, guestNames: resize(state.guestNames, guests), coupon: null });
}

export const setLeadTitle = (leadTitle: string) => set({ leadTitle });
export const setGuestName = (index: number, name: string) => set({ guestNames: state.guestNames.map((n, i) => (i === index ? name : n)) });
export const setContact = (patch: Partial<HotelContact>) => set({ contact: { ...state.contact, ...patch } });
export const setRequests = (patch: Partial<HotelRequests>) => set({ requests: { ...state.requests, ...patch } });
export const setCoupon = (coupon: State['coupon']) => set({ coupon });

export function resetHotelBooking() {
  set({ selection: null, leadTitle: '', guestNames: [''], requests: blankRequests(), coupon: null, voucher: null });
}

/* ---------- derived ---------- */

export function currentFare(s: State = state): { fare: HotelFare; room: HotelRoomOption; nights: number } | null {
  const sel = s.selection;
  if (!sel) return null;
  const rooms = getRoomOptions(sel.hotel);
  const room = rooms.find((r) => r.id === sel.roomId) ?? rooms[0];
  const nightly = parsePrice(room.pricePerNight) ?? parsePrice(sel.hotel.price);
  if (nightly === null) return null;
  const nights = nightsBetween(sel.checkIn, sel.checkOut);
  return { fare: computeHotelFare(nightly, nights, sel.rooms, s.coupon?.discount ?? 0), room, nights };
}

/* ---------- booking ---------- */

const rand = (len: number, chars = '0123456789') => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

/** Simulates a successful payment and issues a dummy hotel voucher. Also records it in My Trips. */
export function confirmHotelBooking(payment: HotelPayment): HotelVoucher | null {
  const derived = currentFare();
  const sel = state.selection;
  if (!derived || !sel || !derived.nights) return null;
  const { fare, room, nights } = derived;
  const { hotel } = sel;
  const lead = `${state.leadTitle} ${state.guestNames[0] ?? ''}`.trim();
  const guests: VoucherGuest[] = state.guestNames.map((n, i) => ({ name: i === 0 ? lead : n.trim() || `Guest ${i + 1}`, lead: i === 0 }));
  const voucher: HotelVoucher = {
    confirmationNo: rand(9), bookingId: `LT-HT-${rand(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789')}`, bookedAt: new Date().toISOString(),
    hotelId: hotel.id, hotelName: hotel.name, image: hotel.gallery?.[0] ?? hotel.image, address: hotel.address ?? hotel.location, location: hotel.location,
    roomName: room.name, breakfast: room.breakfast ?? hotel.breakfast ?? false, cancellation: cancellationInfo(room, hotel),
    checkIn: sel.checkIn, checkOut: sel.checkOut, checkInTime: CHECK_IN_TIME, checkOutTime: CHECK_OUT_TIME, nights, rooms: sel.rooms,
    guests, contact: { ...state.contact }, requests: { ...state.requests },
    fare, couponCode: state.coupon?.code ?? null, payment, txnId: `TXN${rand(12)}`,
  };
  addBooking({
    id: voucher.bookingId, serviceName: 'Hotels', itemName: `${hotel.name} · ${room.name}`,
    price: `₹${fare.total.toLocaleString(getAppLocale())}`, bookedAt: voucher.bookedAt, tripDate: sel.checkIn, destination: hotel.location, status: 'confirmed',
  });
  set({ voucher });
  return voucher;
}
