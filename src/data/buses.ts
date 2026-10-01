import { dummyListings } from './services';

export interface BusListing {
  id: string;
  name: string;
  origin: string;
  destination: string;
  busType: string;
  detail: string;
  duration?: string;
  price: string;
  operator?: string;
  departure?: string;
  arrival?: string;
  seatsAvailable?: number;
  boardingPoints?: string[];
  droppingPoints?: string[];
  rating?: number;
}

export const busListings: BusListing[] = (dummyListings.buses ?? []).map((listing) => {
  const [origin = '', destination = ''] = listing.name.split('→').map((part) => part.trim());
  const duration = listing.detail.match(/\d+\s?h(?:\s?\d+\s?m)?/i)?.[0];

  return {
    ...listing,
    origin,
    destination,
    busType: listing.detail.split('·')[0]?.trim() ?? 'Bus type unavailable',
    ...(duration ? { duration } : {}),
  };
});