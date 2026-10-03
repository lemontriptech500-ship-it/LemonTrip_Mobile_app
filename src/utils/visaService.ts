import type { VisaCountry } from '@/types/content';
import { Linking } from 'react-native';

const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/$/, '');
export const visaApiConfigured = Boolean(configuredBaseUrl);
export const visaApiRoot = configuredBaseUrl ? `${configuredBaseUrl}/api/v1/visa` : null;
export const visaDemoMode = process.env.EXPO_PUBLIC_VISA_DEMO_MODE === 'true';

export type VisaApplication = {
  id: string;
  referenceId: string;
  country: string;
  visaType: string;
  status: string;
  createdAt: string;
  documents: { passportFront: boolean; passportBack: boolean; applicantPhoto: boolean };
};

async function apiRequest<T>(path: string, token: string): Promise<T> {
  if (!visaApiRoot) throw new Error('Visa applications require a configured API connection.');
  const response = await fetch(`${visaApiRoot}${path}`, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } });
  const body = await response.json().catch(() => null) as { error?: string } | null;
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('You are not authorized to access this visa application. Please sign in again.');
    throw new Error(body?.error ?? 'The visa service could not complete your request. Please retry.');
  }
  return body as T;
}

export async function getVisaApplications(token: string, offset = 0) {
  const result = await apiRequest<{ items: VisaApplication[]; pagination: { total: number; hasMore: boolean } }>(`/applications?limit=50&offset=${offset}`, token);
  return result;
}

export async function openVisaApplicationDocument(applicationId: string, documentType: keyof VisaApplication['documents'], token: string) {
  // Request a fresh short-lived link every time; signed URLs are never retained in app state.
  const result = await apiRequest<{ url: string; expiresIn: number }>(`/applications/${encodeURIComponent(applicationId)}/documents/${documentType}`, token);
  try {
    await Linking.openURL(result.url);
  } catch {
    // Let the user retry; the next press obtains a new signed URL.
    throw new Error('Could not open the document. Please try again.');
  }
}

export const mockVisaServices: VisaCountry[] = [
  { id: 'visa-australia-visitor', name: 'Australia', visaType: 'Visitor Visa (Subclass 600)', processing: '20–35 working days', fee: 'INR 5,999', image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=900&q=85', documents: ['Passport', 'Bank statements', 'Travel itinerary', 'Accommodation details'] },
  { id: 'visa-france-schengen', name: 'France', visaType: 'Schengen Tourist Visa', processing: '15–25 working days', fee: 'INR 4,999', image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=900&q=85', documents: ['Passport', 'Photograph', 'Travel itinerary', 'Travel insurance'] },
  { id: 'visa-singapore-tourist', name: 'Singapore', visaType: 'Tourist Visa', processing: '5–10 working days', fee: 'INR 2,499', image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=900&q=85', documents: ['Passport', 'Photograph', 'Accommodation details', 'Return ticket'] },
  { id: 'visa-thailand-arrival', name: 'Thailand', visaType: 'Tourist Visa on Arrival', processing: '1–3 working days', fee: 'INR 1,499', image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=900&q=85', documents: ['Passport', 'Photograph', 'Return ticket', 'Proof of funds'] },
  { id: 'visa-uk-standard-visitor', name: 'United Kingdom', visaType: 'Standard Visitor Visa', processing: '15–30 working days', fee: 'INR 4,999', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=900&q=85', documents: ['Passport', 'Bank statement', 'Travel itinerary', 'Hotel booking'] },
  { id: 'visa-usa-b1-b2', name: 'United States', visaType: 'B1/B2 Tourist Visa', processing: '30–60 working days', fee: 'INR 6,999', image: 'https://images.unsplash.com/photo-1496588152823-86ff7695e68f?w=900&q=85', documents: ['Passport', 'Photograph', 'Travel itinerary', 'Proof of ties'] },
];

export async function getVisaServices() {
  if (!visaApiRoot) {
    if (visaDemoMode) return mockVisaServices;
    throw new Error('Visa services are unavailable because the API is not configured.');
  }
  const response = await fetch(`${visaApiRoot}/destinations`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Visa destinations could not be loaded.');
  const payload = await response.json() as { items?: VisaCountry[] };
  if (!Array.isArray(payload.items)) throw new Error('Visa service returned invalid content.');
  return payload.items;
}
