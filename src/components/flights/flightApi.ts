import type { FlightFareOption, FlightOffer, FlightSearchRequest, FlightSearchResponse } from './types';

const endpoint = process.env.EXPO_PUBLIC_FLIGHT_SEARCH_URL;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isFareOption(value: unknown): value is FlightFareOption {
  if (!isRecord(value) || !isRecord(value.price)) return false;
  return typeof value.id === 'string'
    && typeof value.name === 'string'
    && typeof value.price.total === 'number'
    && typeof value.price.currency === 'string'
    && (value.price.baseFare === undefined || typeof value.price.baseFare === 'number')
    && (value.price.taxes === undefined || typeof value.price.taxes === 'number')
    && (value.price.fees === undefined || typeof value.price.fees === 'number')
    && (value.cabin === undefined || typeof value.cabin === 'string')
    && (value.baggage === undefined || typeof value.baggage === 'string')
    && (value.cancellation === undefined || typeof value.cancellation === 'string')
    && (value.dateChange === undefined || typeof value.dateChange === 'string')
    && (value.seatSelection === undefined || typeof value.seatSelection === 'string')
    && (value.refundable === undefined || typeof value.refundable === 'boolean');
}

function isFlightOffer(value: unknown): value is FlightOffer {
  if (!isRecord(value) || !isRecord(value.airline) || !isRecord(value.departure)
    || !isRecord(value.arrival) || !isRecord(value.price)) return false;

  const validFareOptions = value.fareOptions === undefined
    || (Array.isArray(value.fareOptions) && value.fareOptions.every(isFareOption));
  const validAircraft = value.aircraft === undefined
    || (isRecord(value.aircraft)
      && (value.aircraft.name === undefined || typeof value.aircraft.name === 'string')
      && (value.aircraft.code === undefined || typeof value.aircraft.code === 'string'));

  return validFareOptions
    && validAircraft
    && typeof value.id === 'string'
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
    && typeof value.price.currency === 'string'
    && (value.baggage === undefined || typeof value.baggage === 'string')
    && (value.fareInfo === undefined || typeof value.fareInfo === 'string')
    && (value.refundable === undefined || typeof value.refundable === 'boolean');
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