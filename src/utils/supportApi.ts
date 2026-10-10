export const supportTopics = ['General Booking', 'Travel & Duration', 'Payments', 'Cancellation', 'Account & Login', 'Feedback', 'Visa', 'Other'] as const;
export type SupportTopic = typeof supportTopics[number];
export type SupportRequest = { id: string; topic: string; subject: string; message: string; status: 'new' | 'open' | 'in_progress' | 'closed'; createdAt: string; updateCount: number };
export type SupportUpdate = { id: string; message: string; createdAt: string };
export type SupportForm = { firstName: string; lastName: string; email: string; topic: SupportTopic; subject: string; message: string; reference?: string; submissionKey: string };
const root = `${(process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000').replace(/\/$/, '')}/api/support`;
async function request<T>(path: string, token: string, body?: SupportForm): Promise<T> {
  const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${root}${path}`, { method: body ? 'POST' : 'GET', headers: { Accept: 'application/json', Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined, signal: controller.signal });
    const payload = await response.json().catch(() => null);
    if (!response.ok) throw new Error(typeof payload?.error === 'string' ? payload.error : response.status === 401 ? 'Sign in again to access your support requests.' : 'Support could not complete your request. Please retry.');
    if (!payload || typeof payload !== 'object') throw new Error('Support returned an invalid response.');
    return payload as T;
  } catch (error) { if (controller.signal.aborted) throw new Error('Support timed out. Your details are saved here; please retry.'); throw error; }
  finally { clearTimeout(timeout); }
}
export function submitSupportRequest(form: SupportForm, token: string) { return request<{ request: SupportRequest }>('/requests', token, form); }
export async function listSupportRequests(token: string) { const result = await request<{ items: SupportRequest[] }>('/requests', token); if (!Array.isArray(result.items)) throw new Error('Support returned an invalid request list.'); return result.items; }
export function getSupportRequest(id: string, token: string) { return request<{ request: SupportRequest; updates: SupportUpdate[] }>(`/requests/${encodeURIComponent(id)}`, token); }
