import { fetch as streamFetch } from 'expo/fetch';
import type { ChatMessage } from '@/utils/chatApi';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

export type StreamOptions = {
  token?: string;
  conversationId?: string;
  mode?: 'planner' | 'support';
  signal?: AbortSignal;
  onDelta: (text: string) => void;
};

export type StreamResult = { reply: string; conversationId?: string };

async function readError(response: { json(): Promise<unknown> }): Promise<string> {
  try {
    const payload = await response.json();
    if (payload && typeof payload === 'object' && 'error' in payload && typeof (payload as { error: unknown }).error === 'string') {
      return (payload as { error: string }).error;
    }
  } catch {
    // ignore unreadable error body
  }
  return 'Support is temporarily unavailable.';
}

/** Calls /api/chat/stream and reports the reply piece by piece through onDelta. */
export async function streamChatMessage(message: string, history: ChatMessage[], options: StreamOptions): Promise<StreamResult> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'text/event-stream' };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  const body = JSON.stringify({
    message,
    history: history.slice(-10),
    conversationId: options.conversationId,
    mode: options.mode,
  });

  let response;
  try {
    response = await streamFetch(`${API_URL}/api/chat/stream`, { method: 'POST', headers, body, signal: options.signal });
  } catch {
    if (options.signal?.aborted) throw new Error('Cancelled');
    throw new Error('LemonTrip support timed out or could not be reached. Check your connection and try again.');
  }
  if (!response.ok) throw new Error(await readError(response));

  let reply = '';
  let conversationId: string | undefined;
  let streamError: string | undefined;
  let buffer = '';

  const handleEvent = (raw: string) => {
    const line = raw.split('\n').find((item) => item.startsWith('data:'));
    if (!line) return;
    try {
      const payload = JSON.parse(line.slice(5).trim()) as { delta?: string; conversationId?: string; error?: string };
      if (payload.delta) {
        reply += payload.delta;
        options.onDelta(payload.delta);
      }
      if (payload.conversationId) conversationId = payload.conversationId;
      if (payload.error) streamError = payload.error;
    } catch {
      // ignore a malformed event
    }
  };

  const feed = (text: string) => {
    buffer += text;
    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';
    parts.forEach(handleEvent);
  };

  const reader = response.body?.getReader();
  if (reader && typeof TextDecoder !== 'undefined') {
    const decoder = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      feed(decoder.decode(value, { stream: true }));
    }
  } else {
    // This platform cannot stream: read everything at once (the reply then appears in one go).
    feed(await response.text());
  }
  if (buffer.trim()) handleEvent(buffer);

  if (!reply) throw new Error(streamError ?? 'The AI assistant returned an empty response. Please retry.');
  return { reply, conversationId };
}
