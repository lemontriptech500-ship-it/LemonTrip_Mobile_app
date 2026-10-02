import { useEffect, useState } from 'react';

const endpoint = `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/content`;

export type ContentType = 'package' | 'blog' | 'visa';

export function useContentItems<T>(type: ContentType) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    fetch(`${endpoint}/${type}`, { headers: { Accept: 'application/json' } })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Content service returned an error (${response.status}).`);
        const payload: unknown = await response.json();
        if (typeof payload !== 'object' || payload === null || !('items' in payload) || !Array.isArray(payload.items)) {
          throw new Error('Content service returned invalid content.');
        }
        return payload.items as T[];
      })
      .then((records) => { if (active) setItems(records); })
      .catch(() => { if (active) setError('Could not load content. Check your connection and try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [type]);

  return { items, loading, error };
}
