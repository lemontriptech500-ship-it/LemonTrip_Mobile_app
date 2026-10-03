import { useEffect, useState } from 'react';
import { getVisaServices, visaApiConfigured } from '@/utils/visaService';

const apiRoot = `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000'}/api`;

export type ContentType = 'package' | 'blog' | 'visa' | 'service' | 'destination' | 'listing' | 'hotel';

export function useContentItems<T>(type: ContentType) {
  const [requestId, setRequestId] = useState(0);
  const [state, setState] = useState<{ type: ContentType; requestId: number; items: T[]; loading: boolean; error: string | null }>({
    type,
    requestId: 0,
    items: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    const load = type === 'visa' && !visaApiConfigured
      ? getVisaServices() as Promise<T[]>
      : fetch(`${type === 'visa' ? `${apiRoot}/v1/visa/destinations` : `${apiRoot}/content/${type}`}`, { headers: { Accept: 'application/json' } }).then(async (response) => {
        if (!response.ok) throw new Error(`Content service returned an error (${response.status}).`);
        const payload: unknown = await response.json();
        if (typeof payload !== 'object' || payload === null || !('items' in payload) || !Array.isArray(payload.items)) {
          throw new Error('Content service returned invalid content.');
        }
        return payload.items as T[];
      });
    load
      .then((records) => { if (active) setState({ type, requestId, items: records, loading: false, error: null }); })
      .catch(() => { if (active) setState({ type, requestId, items: [], loading: false, error: 'Could not load content. Check your connection and try again.' }); });
    return () => { active = false; };
  }, [type, requestId]);

  const currentState = state.type === type && state.requestId === requestId ? state : { items: [], loading: true, error: null };
  return { ...currentState, retry: () => setRequestId((current) => current + 1) };
}
