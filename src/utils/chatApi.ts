export type ChatRole = 'user' | 'assistant';
export type ChatMessage = { role: ChatRole; content: string };

type ChatResponse = { success: true; reply: string; conversationId: string };

const endpoint = `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/chat`;

export async function sendChatMessage(message: string, history: ChatMessage[], token?: string, conversationId?: string): Promise<ChatResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  let response: Response;
  try {
    response = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify({ message, history: history.slice(-10), conversationId }), signal: controller.signal });
  } catch {
    throw new Error('LemonTrip support timed out or could not be reached. Check your connection and try again.');
  } finally {
    clearTimeout(timeout);
  }
  let payload: unknown;
  try { payload = await response.json(); } catch { throw new Error('Support returned an unreadable response.'); }
  if (!response.ok) {
    const error = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string' ? payload.error : 'Support is temporarily unavailable.';
    throw new Error(error);
  }
  if (typeof payload !== 'object' || payload === null || !('reply' in payload) || typeof payload.reply !== 'string' || !('conversationId' in payload) || typeof payload.conversationId !== 'string') throw new Error('Support returned an invalid response.');
  return payload as ChatResponse;
}
