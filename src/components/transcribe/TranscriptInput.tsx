import { useState } from 'react';
import { Send, FileText } from 'lucide-react';
import { FileDropZone } from '../shared/FileDropZone';

interface TranscriptInputProps {
  onSubmit: (text: string) => void;
  loading: boolean;
  brandColour: string;
}

const MAX_CHARS = 50_000;

export function TranscriptInput({ onSubmit, loading, brandColour }: TranscriptInputProps) {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'paste' | 'upload'>('paste');

  const charCount = text.length;
  const overLimit = charCount > MAX_CHARS;
  const canSubmit = text.trim().length > 0 && !overLimit && !loading;

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setMode('paste')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mode === 'paste' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <FileText className="h-3 w-3 inline mr-1.5" />
          Paste
        </button>
        <button
          onClick={() => setMode('upload')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mode === 'upload' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Upload file
        </button>
      </div>

      {mode === 'paste' ? (
        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your meeting transcript here..."
            className="w-full min-h-[220px] bg-card border border-border rounded-lg p-4 resize-y text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
          />
          <div className="flex items-center justify-between mt-1.5 px-1">
            <span className={`text-[10px] ${overLimit ? 'text-destructive font-medium' : 'text-muted-foreground/50'}`}>
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
            {overLimit && (
              <span className="text-[10px] text-destructive">Transcript too long</span>
            )}
          </div>
        </div>
      ) : (
        <FileDropZone
          onFileContent={(content) => { setText(content); setMode('paste'); }}
        />
      )}

      <button
        onClick={() => canSubmit && onSubmit(text)}
        disabled={!canSubmit}
        style={{ backgroundColor: canSubmit ? brandColour : undefined }}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-sm text-white disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {loading ? (
          <>
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analysing...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Process transcript
          </>
        )}
      </button>
    </div>
  );
}
