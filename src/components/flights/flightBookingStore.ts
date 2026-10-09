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

export type FlightBookingDraft = {
  travellers: TravellerInfo[];
  contactEmail: string;
  contactPhone: string;
  seats: string[];
  addOns: FlightAddOns;
};

const emptyDraft = (): FlightBookingDraft => ({
  travellers: [],
  contactEmail: '',
  contactPhone: '',
  seats: [],
  addOns: { baggage: false, meal: false, insurance: false },
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
