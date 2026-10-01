import type { FlightFareOption, FlightOffer, FlightSearchRequest, FlightSelection } from './types';

let currentSelection: FlightSelection | null = null;

export function setFlightSelection(request: FlightSearchRequest, offer: FlightOffer) {
  currentSelection = { request, offer };
}

export function selectFlightFare(fareOption: FlightFareOption) {
  if (currentSelection) currentSelection = { ...currentSelection, fareOption };
}

export function getFlightSelection() {
  return currentSelection;
}