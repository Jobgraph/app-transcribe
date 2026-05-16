import type { HistoryEntry, TranscriptResult } from './types';

const STORAGE_KEY = 'jg-transcribe-history';
const MAX_ENTRIES = 50;

function read(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function getHistory(): HistoryEntry[] {
  return read();
}

export function addEntry(input: string): HistoryEntry {
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    inputPreview: input.slice(0, 80).replace(/\n/g, ' '),
    input,
    result: null,
    status: 'pending',
  };
  const entries = read();
  entries.unshift(entry);
  write(entries);
  return entry;
}

export function updateEntry(id: string, patch: Partial<HistoryEntry>) {
  const entries = read();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx === -1) return;
  entries[idx] = { ...entries[idx], ...patch };
  write(entries);
}

export function completeEntry(id: string, result: TranscriptResult) {
  updateEntry(id, { result, status: 'complete' });
}

export function failEntry(id: string, errorMessage: string) {
  updateEntry(id, { status: 'error', errorMessage });
}


export function deleteEntry(id: string) {
  write(read().filter((e) => e.id !== id));
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
