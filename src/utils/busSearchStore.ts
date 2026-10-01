import type { BusListing } from '@/data/buses';

export interface BusSearchCriteria {
  from: string;
  to: string;
  travelDate: string;
}

let criteria: BusSearchCriteria = { from: '', to: '', travelDate: '' };
let selectedBus: BusListing | null = null;

export function setBusSearch(value: BusSearchCriteria) {
  criteria = value;
}

export function getBusSearch() {
  return criteria;
}

export function selectBus(bus: BusListing) {
  selectedBus = bus;
}

export function getSelectedBus() {
  return selectedBus;
}