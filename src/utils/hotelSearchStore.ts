import type { Hotel } from '@/data/hotels';

export interface HotelSearchCriteria {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

let selectedHotel: Hotel | null = null;
let currentSearch: HotelSearchCriteria = {
  destination: '',
  checkIn: '',
  checkOut: '',
  guests: 2,
  rooms: 1,
};

export function setHotelSearch(criteria: HotelSearchCriteria) {
  currentSearch = criteria;
}

export function getHotelSearch() {
  return currentSearch;
}

export function selectHotel(hotel: Hotel) {
  selectedHotel = hotel;
}

export function getSelectedHotel() {
  return selectedHotel;
}