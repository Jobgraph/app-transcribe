import { useState } from 'react';
import { Download, Copy, FileText, ChevronDown } from 'lucide-react';
import type { TranscriptResult } from '../../lib/types';
import { copyAsMarkdown, downloadMarkdown } from '../../lib/export';

interface ExportMenuProps {
  result: TranscriptResult;
}

export function ExportMenu({ result }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2000);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-muted text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
      >
        <Download className="h-4 w-4" />
        Export
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {feedback && (
        <span className="absolute -top-8 left-0 text-xs text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">
          {feedback}
        </span>
      )}

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-50 w-48 rounded-lg border border-border bg-card shadow-lg py-1">
            <button
              onClick={() => { copyAsMarkdown(result).then(() => showFeedback('Copied!')); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copy as Markdown
            </button>
            <button
              onClick={() => { downloadMarkdown(result); showFeedback('Downloaded!'); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <FileText className="h-4 w-4" />
              Download .md
            </button>
            <button
              onClick={() => { window.print(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Download className="h-4 w-4" />
              Print / Save as PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}
