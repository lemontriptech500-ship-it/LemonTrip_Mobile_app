export type Traveller = { firstName: string; lastName: string };
export type CheckoutDetails = { name: string; email: string; phone: string; travellers: Traveller[] };
let details: CheckoutDetails | null = null;
export function setCheckoutDetails(value: CheckoutDetails) { details = { ...value, travellers: value.travellers.map(traveller => ({ ...traveller })) }; }
export function getCheckoutDetails() { return details; }

export function clearCheckoutDetails() { details = null; preferences = { seat: 'No preference', note: 'None' }; }

let preferences = { seat: 'No preference', note: 'None' };
export function getTravelPreferences() { return preferences; }
export function setTravelPreferences(value: typeof preferences) { preferences = { ...value }; }
