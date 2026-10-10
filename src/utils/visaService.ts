import { mockVisaServices } from '@/data/mock/visaServices';
import { Linking } from 'react-native';

const configuredVisaBaseUrl = (process.env.EXPO_PUBLIC_VISA_API_URL ?? process.env.EXPO_PUBLIC_API_URL)?.trim().replace(/\/$/, '');
export const visaApiConfigured = Boolean(configuredVisaBaseUrl);
export const visaApiRoot = configuredVisaBaseUrl ? `${configuredVisaBaseUrl}/api/v1/visa` : null;
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

export type VisaDocumentKey = keyof VisaApplication['documents'];

async function apiRequest<T>(path: string, token: string): Promise<T> {
  if (!visaApiRoot) throw new Error('Visa applications require a configured API connection.');
  const response = await fetch(`${visaApiRoot}${path}`, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } });
  const body = await response.json().catch(() => null) as { error?: string | { message?: string } } | null;
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new Error('You are not authorized to access this visa application. Please sign in again.');
    throw new Error((typeof body?.error === 'string' ? body.error : body?.error?.message) ?? 'The visa service could not complete your request. Please retry.');
  }
  return body as T;
}

export async function getVisaApplications(token: string, offset = 0) {
  const result = await apiRequest<{ items: VisaApplication[]; pagination: { total: number; hasMore: boolean } }>(`/applications?limit=50&offset=${offset}`, token);
  return result;
}

export async function openVisaApplicationDocument(applicationId: string, documentType: VisaDocumentKey, token: string) {
  // Request a fresh short-lived link every time; signed URLs are never retained in app state.
  const result = await getVisaDocumentUrl(applicationId, documentType, token);
  try {
    await Linking.openURL(result.url);
  } catch {
    // Let the user retry; the next press obtains a new signed URL.
    throw new Error('Could not open the document. Please try again.');
  }
}

export async function getVisaDocumentUrl(applicationId: string, document: VisaDocumentKey, accessToken: string) {
  const result = await apiRequest<{ url: string; expiresIn: number }>(`/applications/${encodeURIComponent(applicationId)}/documents/${document}`, accessToken);
  if (!result.url?.startsWith('https://')) throw new Error('The document service returned an invalid link.');
  return result;
}

export async function getVisaServices() {
  if (!visaApiRoot) {
    if (visaDemoMode) return mockVisaServices;
    throw new Error('Visa services are unavailable because the API is not configured.');
  }
  const response = await fetch(`${visaApiRoot}/services`, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Visa destinations could not be loaded.');
  const payload = await response.json() as { data?: { services?: { id: string; country: string; visaType: string; processingTime?: string; startingFrom?: string; imageUrl?: string; documents?: string[] }[] } };
  if (!Array.isArray(payload.data?.services)) throw new Error('Visa service returned invalid content.');
  return payload.data.services.map(service => ({ id: service.id, name: service.country, visaType: service.visaType, processing: service.processingTime ?? null, fee: service.startingFrom ?? null, image: service.imageUrl ?? '', documents: service.documents ?? [] }));
}

export type VisaTracking = { id: string; country: string; visaType: string; applicantName: string; status: string; submittedDate: string; dateOfBirth?: string | null; passportNumber?: string; intendedEntryDate?: string | null; uploadedDocuments?: { passportFront: boolean; passportBack: boolean; applicantPhoto: boolean } };
export async function getVisaApplication(id: string, token: string) {
  const result = await apiRequest<{ data: VisaTracking }>(`/applications/${encodeURIComponent(id)}`, token);
  if (!result.data || result.data.id !== id || typeof result.data.status !== 'string') throw new Error('Application details could not be verified.');
  return result.data;
}
