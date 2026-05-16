export interface TranscriptResult {
  summary: string;
  decisions: string[];
  actions: { what: string; who: string; by: string }[];
  followUpEmail: string;
}

export interface HistoryEntry {
  id: string;
  createdAt: string;
  inputPreview: string;
  input: string;
  result: TranscriptResult | null;
  status: 'pending' | 'complete' | 'error';
  errorMessage?: string;
}
