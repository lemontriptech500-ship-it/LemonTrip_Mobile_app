import { defaultHotelSearch, mockHotels } from '@/data/mockHotels';
import type { Hotel } from '@/types/content';

export interface HotelSearchCriteria {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export function normalizeHotelSearch(criteria?: Partial<HotelSearchCriteria> | null): HotelSearchCriteria {
  const fallback = { ...defaultHotelSearch };
  const destination = typeof criteria?.destination === 'string' ? criteria.destination.trim() : fallback.destination;
  const checkIn = typeof criteria?.checkIn === 'string' ? criteria.checkIn.trim() : fallback.checkIn;
  const checkOut = typeof criteria?.checkOut === 'string' ? criteria.checkOut.trim() : fallback.checkOut;
  const guests = Number.isFinite(criteria?.guests) ? Math.min(12, Math.max(1, Number(criteria?.guests))) : fallback.guests;
  const rooms = Number.isFinite(criteria?.rooms) ? Math.min(6, Math.max(1, Number(criteria?.rooms))) : fallback.rooms;

  return {
    destination,
    checkIn,
    checkOut,
    guests,
    rooms,
  };
}

let selectedHotel: Hotel | null = mockHotels[0] ?? null;
let currentSearch: HotelSearchCriteria = normalizeHotelSearch(defaultHotelSearch);

export function setHotelSearch(criteria: HotelSearchCriteria) {
  currentSearch = normalizeHotelSearch(criteria);
}

export function getHotelSearch() {
  return currentSearch;
}

export function selectHotel(hotel: Hotel) {
  selectedHotel = hotel;
}

export function getSelectedHotel() {
  if (!selectedHotel) {
    selectedHotel = mockHotels[0] ?? null;
  }
  return selectedHotel;
}