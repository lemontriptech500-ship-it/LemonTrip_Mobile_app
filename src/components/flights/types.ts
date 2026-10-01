export type TripType = 'oneWay' | 'roundTrip' | 'multiCity';
export type SpecialFare = 'regular' | 'student' | 'seniorCitizen' | 'armedForces';
export type FlightSortOption = 'recommended' | 'cheapest' | 'fastest' | 'earliest';

export interface FlightSearchRequest {
  tripType: TripType;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  multiCityLegs?: Array<{ origin: string; destination: string; departureDate: string }>;
  travellers: number;
  cabinClass: string;
  specialFare: SpecialFare;
}

export interface FlightOffer {
  id: string;
  airline: { name: string; code: string; logoUrl?: string };
  flightNumber: string;
  departure: { time: string; airportCode: string; airportName?: string };
  arrival: { time: string; airportCode: string; airportName?: string };
  durationMinutes: number;
  stops: number;
  baggage?: string;
  price: { amount: number; currency: string };
  fareInfo?: string;
  refundable?: boolean;
}

export interface FlightSearchResponse {
  offers: FlightOffer[];
}

export interface FlightFiltersState {
  stops: string[];
  airlines: string[];
  departurePeriods: string[];
  arrivalPeriods: string[];
  maxDurationHours: number | null;
  maxPrice: number | null;
  baggage: 'any' | 'included' | 'notIncluded';
}

export const emptyFlightFilters: FlightFiltersState = {
  stops: [],
  airlines: [],
  departurePeriods: [],
  arrivalPeriods: [],
  maxDurationHours: null,
  maxPrice: null,
  baggage: 'any',
};