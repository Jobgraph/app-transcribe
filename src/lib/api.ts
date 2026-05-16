import type { TranscriptResult } from './types';
import { MOCK_RESULT } from './mock';

export type ProcessError =
  | { code: 'RATE_LIMITED'; message: string }
  | { code: 'INPUT_TOO_LARGE'; message: string }
  | { code: 'UNAVAILABLE'; message: string }
  | { code: 'NETWORK'; message: string }
  | { code: 'UNKNOWN'; message: string };

export type ProcessResult =
  | { ok: true; data: TranscriptResult }
  | { ok: false; error: ProcessError };

export async function processTranscript(
  deploymentId: string,
  input: string,
): Promise<ProcessResult> {
  if (deploymentId === 'local') {
    await new Promise((r) => setTimeout(r, 1500));
    return { ok: true, data: MOCK_RESULT };
  }

  try {
    const token = localStorage.getItem('jg-transcribe-token');
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(
      `https://app.jobgraph.com/api/apps/${deploymentId}/process`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ input, type: 'transcribe' }),
      },
    );

    if (res.status === 429)
      return { ok: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Try again in a few minutes.' } };
    if (res.status === 422)
      return { ok: false, error: { code: 'INPUT_TOO_LARGE', message: 'Transcript is too long. Try a shorter section.' } };
    if (res.status === 403)
      return { ok: false, error: { code: 'UNAVAILABLE', message: 'This app is not currently available.' } };
    if (!res.ok)
      return { ok: false, error: { code: 'UNKNOWN', message: `Request failed (${res.status}).` } };

    const json = await res.json();
    return { ok: true, data: json.structured };
  } catch {
    return { ok: false, error: { code: 'NETWORK', message: 'Could not reach the server. Check your connection.' } };
  }
}
