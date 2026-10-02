import { useEffect, useState } from 'react';

const endpoint = `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/content`;

export type ContentType = 'package' | 'blog' | 'visa' | 'service' | 'destination' | 'listing' | 'hotel';

export function useContentItems<T>(type: ContentType) {
  const [state, setState] = useState<{ type: ContentType; items: T[]; loading: boolean; error: string | null }>({
    type,
    items: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    let active = true;
    fetch(`${endpoint}/${type}`, { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Content service returned an error (${response.status}).`);
        const payload: unknown = await response.json();
        if (typeof payload !== 'object' || payload === null || !('items' in payload) || !Array.isArray(payload.items)) {
          throw new Error('Content service returned invalid content.');
        }
        return payload.items as T[];
      })
      .then((records) => { if (active) setState({ type, items: records, loading: false, error: null }); })
      .catch(() => { if (active) setState({ type, items: [], loading: false, error: 'Could not load content. Check your connection and try again.' }); });
    return () => { active = false; };
  }, [type]);

  return state.type === type ? state : { items: [], loading: true, error: null };
}
