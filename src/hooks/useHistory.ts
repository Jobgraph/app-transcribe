import { useCallback, useMemo, useState } from 'react';
import type { HistoryEntry, TranscriptResult } from '../lib/types';
import * as history from '../lib/history';

function recoverStaleEntries(entries: HistoryEntry[]): HistoryEntry[] {
  let changed = false;
  const recovered = entries.map((e) => {
    if (e.status === 'pending') {
      changed = true;
      return { ...e, status: 'error' as const, errorMessage: 'Processing was interrupted. Please retry.' };
    }
    return e;
  });
  if (changed) {
    localStorage.setItem('jg-transcribe-history', JSON.stringify(recovered));
  }
  return recovered;
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => recoverStaleEntries(history.getHistory()));
  const [activeId, setActiveId] = useState<string | null>(null);

  const refresh = useCallback(() => setEntries(history.getHistory()), []);

  const add = useCallback((input: string) => {
    const entry = history.addEntry(input);
    refresh();
    setActiveId(entry.id);
    return entry;
  }, [refresh]);

  const complete = useCallback((id: string, result: TranscriptResult) => {
    history.completeEntry(id, result);
    refresh();
  }, [refresh]);

  const fail = useCallback((id: string, msg: string) => {
    history.failEntry(id, msg);
    refresh();
  }, [refresh]);

  const remove = useCallback((id: string) => {
    if (activeId === id) setActiveId(null);
    history.deleteEntry(id);
    refresh();
  }, [activeId, refresh]);

  const clearAll = useCallback(() => {
    history.clearHistory();
    setActiveId(null);
    refresh();
  }, [refresh]);

  const active = activeId ? entries.find((e) => e.id === activeId) ?? null : null;

  return useMemo(() => (
    { entries, active, activeId, setActiveId, add, complete, fail, remove, clearAll }
  ), [entries, active, activeId, setActiveId, add, complete, fail, remove, clearAll]);
}
