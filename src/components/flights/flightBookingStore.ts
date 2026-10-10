import { getFlightSelection } from '@/components/flights/flightSelectionStore';
import { addBooking } from '@/utils/bookingStore';

export type Gender = 'Male' | 'Female' | 'Other' | '';

export type TravellerInfo = {
  firstName: string;
  lastName: string;
  gender: Gender;
  dob: string;
};

export type FlightAddOns = {
  baggage: boolean;
  meal: boolean;
  insurance: boolean;
};

export type FlightPayment = {
  method: 'upi' | 'card' | 'netbanking' | 'wallet';
  label: string;
};

export type FlightTicket = {
  pnr: string;
  bookingId: string;
  bookedAt: string;
  txnId: string;
  airline: string;
  flightNumber: string;
  fromCode: string;
  toCode: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  fareName: string;
  travellers: TravellerInfo[];
  seats: string[];
  addOns: string[];
  contactEmail: string;
  contactPhone: string;
  currency: string;
  fareTotal: number;
  seatTotal: number;
  addOnTotal: number;
  total: number;
  payment: FlightPayment;
};

export type FlightBookingDraft = {
  travellers: TravellerInfo[];
  contactEmail: string;
  contactPhone: string;
  seats: string[];
  addOns: FlightAddOns;
  seatTotal: number;
  addOnTotal: number;
  ticket: FlightTicket | null;
};

const emptyDraft = (): FlightBookingDraft => ({
  travellers: [],
  contactEmail: '',
  contactPhone: '',
  seats: [],
  addOns: { baggage: false, meal: false, insurance: false },
  seatTotal: 0,
  addOnTotal: 0,
  ticket: null,
});

// In-memory draft for the flight booking flow (same pattern as flightSelectionStore).
let draft: FlightBookingDraft = emptyDraft();

export function getFlightBookingDraft(): FlightBookingDraft {
  return draft;
}

export function updateFlightBookingDraft(patch: Partial<FlightBookingDraft>) {
  draft = { ...draft, ...patch };
}

export function resetFlightBookingDraft() {
  draft = emptyDraft();
}

const rand = (len: number, chars = '0123456789') =>
  Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

function money(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString('en-IN')}`;
  }
}

/** Simulates a successful payment, issues a demo e-ticket and records it in My Trips. */
export function confirmFlightBooking(payment: FlightPayment): FlightTicket | null {
  const selection = getFlightSelection();
  if (!selection) return null;

  const { offer, fareOption, request } = selection;
  const fare = fareOption ?? offer.fareOptions?.[0];
  const currency = fare ? fare.price.currency : offer.price.currency;
  const fareTotal = fare ? fare.price.total : offer.price.amount;
  const total = fareTotal + draft.seatTotal + draft.addOnTotal;

  const addOns: string[] = [];
  if (draft.addOns.baggage) addOns.push('Extra baggage');
  if (draft.addOns.meal) addOns.push('In-flight meal');
  if (draft.addOns.insurance) addOns.push('Travel insurance');

  const ticket: FlightTicket = {
    pnr: rand(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'),
    bookingId: `LT-FL-${rand(6, 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789')}`,
    bookedAt: new Date().toISOString(),
    txnId: `TXN${rand(12)}`,
    airline: offer.airline.name,
    flightNumber: offer.flightNumber,
    fromCode: offer.departure.airportCode,
    toCode: offer.arrival.airportCode,
    date: request.departureDate,
    departureTime: offer.departure.time,
    arrivalTime: offer.arrival.time,
    durationMinutes: offer.durationMinutes,
    stops: offer.stops,
    fareName: fare?.name ?? 'Standard',
    travellers: draft.travellers,
    seats: draft.seats,
    addOns,
    contactEmail: draft.contactEmail,
    contactPhone: draft.contactPhone,
    currency,
    fareTotal,
    seatTotal: draft.seatTotal,
    addOnTotal: draft.addOnTotal,
    total,
    payment,
  };

  addBooking({
    id: ticket.bookingId,
    serviceName: 'Flights',
    itemName: `${ticket.airline} ${ticket.flightNumber} - ${ticket.fromCode} to ${ticket.toCode}`,
    price: money(total, currency),
    bookedAt: ticket.bookedAt,
    tripDate: ticket.date,
    destination: ticket.toCode,
    status: 'confirmed',
  });

  draft = { ...draft, ticket };
  return ticket;
}
