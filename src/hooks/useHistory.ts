import { useCallback, useState } from 'react';
import type { HistoryEntry, TranscriptResult } from '../lib/types';
import * as history from '../lib/history';

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(() => history.getHistory());
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
    history.deleteEntry(id);
    if (activeId === id) setActiveId(null);
    refresh();
  }, [activeId, refresh]);

  const clearAll = useCallback(() => {
    history.clearHistory();
    setActiveId(null);
    refresh();
  }, [refresh]);

  const active = activeId ? entries.find((e) => e.id === activeId) ?? null : null;

  return { entries, active, activeId, setActiveId, add, complete, fail, remove, clearAll };
}
