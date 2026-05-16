import { useState, useCallback } from 'react';
import { ThemeContext } from './lib/theme';
import { useThemeProvider } from './hooks/useTheme';
import { useConfig } from './hooks/useConfig';
import { useHistory } from './hooks/useHistory';
import { processTranscript } from './lib/api';
import { AppShell } from './components/shell/AppShell';
import { TranscriptInput } from './components/transcribe/TranscriptInput';
import { ResultDisplay } from './components/transcribe/ResultDisplay';
import { LoadingSkeleton } from './components/shared/LoadingSkeleton';
import { FileText } from 'lucide-react';

export default function App() {
  const themeCtx = useThemeProvider();
  const { config, loading: configLoading } = useConfig();
  const { entries, active, activeId, setActiveId, add, complete, fail, remove, clearAll } = useHistory();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (text: string) => {
    if (!config) return;
    setError(null);
    setProcessing(true);

    const entry = add(text);

    try {
      const res = await processTranscript(config.deploymentId, text);
      if (res.ok) {
        complete(entry.id, res.data);
      } else {
        fail(entry.id, res.error.message);
        setError(res.error.message);
      }
    } finally {
      setProcessing(false);
    }
  }, [config, add, complete, fail]);

  const handleNew = useCallback(() => {
    setActiveId(null);
    setError(null);
    setProcessing(false);
  }, [setActiveId]);

  // Config loading screen
  if (configLoading || !config) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeEntry = active;
  const showInput = !activeEntry || activeEntry.status === 'error';
  const showResult = activeEntry?.status === 'complete' && activeEntry.result;
  const showSkeleton = processing || activeEntry?.status === 'pending';

  return (
    <ThemeContext value={themeCtx}>
      <AppShell
        config={config}
        entries={entries}
        activeId={activeId}
        onSelectEntry={setActiveId}
        onNewEntry={handleNew}
        onDeleteEntry={remove}
        onClearAll={clearAll}
      >
        <div className="max-w-3xl mx-auto px-6 py-8">
          {/* Empty state */}
          {!activeEntry && !processing && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-1">
                <FileText className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">{config.appName}</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Paste or upload a meeting transcript to get a structured summary, key decisions, action items, and a follow-up email.
              </p>
            </div>
          )}

          {/* Input */}
          {showInput && (
            <div className="mb-8">
              <TranscriptInput
                onSubmit={handleSubmit}
                loading={processing}
                brandColour={config.brandColour}
              />
              {error && (
                <div className="mt-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Loading */}
          {showSkeleton && <LoadingSkeleton />}

          {/* Result */}
          {showResult && activeEntry.result && (
            <ResultDisplay result={activeEntry.result} />
          )}

          {/* Back to input from completed result */}
          {showResult && (
            <div className="mt-6 pt-4 border-t border-border">
              <button
                onClick={handleNew}
                className="text-sm text-primary hover:underline font-medium"
              >
                Process another transcript
              </button>
            </div>
          )}
        </div>
      </AppShell>
    </ThemeContext>
  );
}
