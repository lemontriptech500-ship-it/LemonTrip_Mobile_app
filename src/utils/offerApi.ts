import { offers as demoOffers, type Offer } from '@/data/offers';

const endpoint = process.env.EXPO_PUBLIC_OFFERS_URL;

export type OfferSource = 'backend' | 'demo';
export type OfferValidity = 'active' | 'expired' | 'unknown';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isOffer(value: unknown): value is Offer {
  return isRecord(value)
    && typeof value.id === 'string'
    && typeof value.category === 'string'
    && typeof value.title === 'string'
    && typeof value.description === 'string'
    && typeof value.image === 'string'
    && (value.code === undefined || typeof value.code === 'string')
    && (value.discount === undefined || typeof value.discount === 'string')
    && (value.validUntil === undefined || typeof value.validUntil === 'string')
    && (value.terms === undefined || typeof value.terms === 'string');
}

export async function loadOffers(): Promise<{ offers: Offer[]; source: OfferSource }> {
  if (!endpoint) return { offers: demoOffers, source: 'demo' };

  let response: Response;
  try {
    response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
  } catch {
    throw new Error('Could not reach the offers service. Check your connection and try again.');
  }

  if (!response.ok) throw new Error(`Offers service returned an error (${response.status}).`);

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The offers service returned an unreadable response.');
  }

  const records = Array.isArray(payload) ? payload : isRecord(payload) ? payload.offers : undefined;
  if (!Array.isArray(records) || !records.every(isOffer)) {
    throw new Error('The offers response must contain valid offer records.');
  }

  return { offers: records, source: 'backend' };
}

export function getOfferValidity(validUntil: string | undefined, now = new Date()): OfferValidity {
  if (!validUntil?.trim()) return 'unknown';
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(validUntil);
  const expiry = new Date(dateOnly ? `${validUntil}T23:59:59` : validUntil);
  if (Number.isNaN(expiry.getTime())) return 'unknown';
  return expiry.getTime() < now.getTime() ? 'expired' : 'active';
}

export function getOfferCategory(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes('flight')) return 'Flights';
  if (normalized.includes('hotel') || normalized.includes('stay')) return 'Hotels';
  if (normalized.includes('bus')) return 'Buses';
  if (normalized.includes('package') || normalized.includes('holiday')) return 'Packages';
  if (normalized.includes('visa')) return 'Visa';
  return null;
}