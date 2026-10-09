import { useEffect, useState } from 'react';
import { useAuth } from './authStore';
import type { Booking } from './bookingStore';
import { featureRequest } from './featureApi';

export type AccountBooking = Booking & { paymentStatus?: string; providerReference?: string | null };
function isBooking(value: unknown): value is AccountBooking {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<AccountBooking>;
  return typeof item.id === 'string' && typeof item.serviceName === 'string' && typeof item.itemName === 'string' && typeof item.price === 'string' && typeof item.bookedAt === 'string';
}
export function useAccountBookings(enabled = true) {
  const user = useAuth(); const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{ actor: string; revision: number; bookings: AccountBooking[]; error: string }>({ actor: '', revision: -1, bookings: [], error: '' });
  useEffect(() => { let active = true; if (!user || !enabled) return; void featureRequest<{ bookings: unknown }>(process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000', '/api/bookings').then(data => { if (!Array.isArray(data.bookings) || !data.bookings.every(isBooking)) throw new Error('Booking details could not be verified.'); if (active) setState({ actor: user.id, revision, bookings: data.bookings, error: '' }); }).catch(cause => { if (active) setState({ actor: user.id, revision, bookings: [], error: cause instanceof Error ? cause.message : 'Trips unavailable.' }); }); return () => { active = false; }; }, [user, enabled, revision]);
  const current = user?.id === state.actor;
  return { bookings: current ? state.bookings : [], error: current ? state.error : '', loading: Boolean(user && enabled && (!current || revision !== state.revision)), refresh: () => setRevision(current => current + 1) };
}
