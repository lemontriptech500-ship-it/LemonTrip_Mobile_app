import type { FlightOffer, FlightSearchRequest, FlightSearchResponse } from './types';

const endpoint = process.env.EXPO_PUBLIC_FLIGHT_SEARCH_URL;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFlightOffer(value: unknown): value is FlightOffer {
  if (!isRecord(value) || !isRecord(value.airline) || !isRecord(value.departure)
    || !isRecord(value.arrival) || !isRecord(value.price)) return false;

  return typeof value.id === 'string'
    && typeof value.airline.name === 'string'
    && typeof value.airline.code === 'string'
    && typeof value.flightNumber === 'string'
    && typeof value.departure.time === 'string'
    && typeof value.departure.airportCode === 'string'
    && typeof value.arrival.time === 'string'
    && typeof value.arrival.airportCode === 'string'
    && typeof value.durationMinutes === 'number'
    && typeof value.stops === 'number'
    && typeof value.price.amount === 'number'
    && typeof value.price.currency === 'string';
}

export async function searchFlights(request: FlightSearchRequest): Promise<FlightSearchResponse> {
  if (!endpoint) {
    throw new Error('Flight search is not connected. Configure EXPO_PUBLIC_FLIGHT_SEARCH_URL to use live results.');
  }

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(request),
    });
  } catch {
    throw new Error('We could not reach the flight service. Check your connection and try again.');
  }

  if (!response.ok) {
    throw new Error(`Flight service returned an error (${response.status}). Please try again.`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The flight service returned an unreadable response.');
  }

  const offers = isRecord(payload) ? payload.offers : undefined;
  if (!Array.isArray(offers) || !offers.every(isFlightOffer)) {
    throw new Error('The flight service response did not match the supported flight offer format.');
  }

  return { offers: offers as FlightOffer[] };
}