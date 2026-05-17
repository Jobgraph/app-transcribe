import { useState, useEffect } from 'react';
import { Mic, Upload, ClipboardPaste } from 'lucide-react';
import { type AppConfig, loadConfig } from './config';
import { AudioRecorder } from './components/AudioRecorder';
import { AudioUploadZone } from './components/AudioUploadZone';

interface Structured {
  summary: string;
  decisions: string[];
  actions: { what: string; who: string; by: string }[];
  followUpEmail: string;
}

type InputMode = 'record' | 'upload' | 'paste';

function toMarkdown(data: Structured): string {
  let md = `## Summary\n\n${data.summary || 'N/A'}\n\n## Key Decisions\n\n`;
  if (data.decisions?.length) {
    data.decisions.forEach((d) => (md += `- ${d}\n`));
  } else {
    md += '_None identified._\n';
  }
  md += `\n## Action Items\n\n| What | Who | By |\n|------|-----|----|\n`;
  if (data.actions?.length) {
    data.actions.forEach((a) => (md += `| ${a.what} | ${a.who} | ${a.by} |\n`));
  } else {
    md += '| — | — | — |\n';
  }
  md += `\n## Follow-up Email\n\n${data.followUpEmail || 'N/A'}\n`;
  return md;
}

const TABS: { key: InputMode; label: string; Icon: typeof Mic }[] = [
  { key: 'record', label: 'Record', Icon: Mic },
  { key: 'upload', label: 'Upload', Icon: Upload },
  { key: 'paste', label: 'Paste', Icon: ClipboardPaste },
];

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [mode, setMode] = useState<InputMode>('record');
  const [transcript, setTranscript] = useState('');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [result, setResult] = useState<Structured | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConfig().then(setConfig);
  }, []);

  if (!config) return null;

  if (!config.isConfigured) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="text-center max-w-md space-y-4">
          <h1 className="text-2xl font-semibold">{config.appName}</h1>
          <p className="text-white/60">This app is not configured. Deploy it from Jobgraph to get started.</p>
          <a href="https://app.jobgraph.com" className="inline-block px-4 py-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 transition-colors">Go to Jobgraph</a>
        </div>
      </div>
    );
  }

  const isAudioMode = mode === 'record' || mode === 'upload';
  const hasAudioInput = (mode === 'record' && recordedBlob !== null) || (mode === 'upload' && uploadedFile !== null);
  const hasTextInput = mode === 'paste' && transcript.trim().length > 0;
  const canSubmit = !loading && (hasAudioInput || hasTextInput);

  async function process() {
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const audioBlob = mode === 'record' ? recordedBlob : mode === 'upload' ? uploadedFile : null;

      const baseUrl = (window as any).__JOBGRAPH_CONFIG__ ? '' : 'https://app.jobgraph.com';
      const processUrl = `${baseUrl}/api/apps/${config!.deploymentId}/process`;

      let res: Response;
      if (isAudioMode && audioBlob && config!.deploymentId !== 'local') {
        const formData = new FormData();
        let filename: string;
        if (mode === 'upload' && uploadedFile) {
          filename = uploadedFile.name;
        } else {
          const ext = audioBlob!.type.includes('mp4') ? 'mp4' : audioBlob!.type.includes('ogg') ? 'ogg' : 'webm';
          filename = `recording.${ext}`;
        }
        formData.append('audio', audioBlob, filename);
        formData.append('type', 'transcribe');
        res = await fetch(processUrl, { method: 'POST', body: formData });
      } else {
        res = await fetch(processUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: transcript || '[audio transcription]', type: 'transcribe' }),
        });
      }

      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const { structured } = await res.json();
      if (!structured) throw new Error('No structured data returned.');
      setResult(structured);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    if (!result) return;
    navigator.clipboard.writeText(toMarkdown(result));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleReset() {
    setResult(null);
    setError('');
    setRecordedBlob(null);
    setUploadedFile(null);
    setTranscript('');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        {config.logoUrl && (
          <img src={config.logoUrl} alt="" className="h-8 w-8 rounded" />
        )}
        <h1 className="text-xl font-semibold">{config.appName}</h1>
        <span className="text-sm text-white/50">{config.orgName}</span>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Hero text when no result */}
        {!result && !loading && (
          <div className="text-center mb-2">
            <h2 className="text-2xl font-bold text-white/90 mb-1">Audio Transcription</h2>
            <p className="text-sm text-white/50">
              Record, upload, or paste audio to get a structured summary, key decisions, action items, and a follow-up email.
            </p>
          </div>
        )}

        {/* Input area */}
        {!result && (
          <>
            {/* Mode tabs */}
            <div className="flex justify-center">
              <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
                {TABS.map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    onClick={() => setMode(key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      mode === key
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
              {mode === 'record' && (
                <AudioRecorder
                  onRecorded={setRecordedBlob}
                  recordedBlob={recordedBlob}
                  onClear={() => setRecordedBlob(null)}
                />
              )}

              {mode === 'upload' && (
                <AudioUploadZone
                  onFile={setUploadedFile}
                  uploadedFile={uploadedFile}
                  onClear={() => setUploadedFile(null)}
                />
              )}

              {mode === 'paste' && (
                <div>
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Paste your meeting transcript here..."
                    className="w-full min-h-[200px] bg-white/5 border border-white/10 rounded-lg p-4 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
              )}
            </div>

            {/* Submit button */}
            <div className="flex justify-center">
              <button
                onClick={process}
                disabled={!canSubmit && !loading}
                style={{ backgroundColor: (canSubmit || loading) ? config.brandColour : undefined }}
                className={`px-8 py-3 rounded-xl font-medium text-white transition-all text-sm ${
                  loading
                    ? 'cursor-wait opacity-90'
                    : canSubmit
                      ? 'hover:opacity-90'
                      : 'disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {isAudioMode ? 'Transcribing...' : 'Analysing...'}
                  </span>
                ) : (
                  isAudioMode ? 'Transcribe' : 'Process transcript'
                )}
              </button>
            </div>
          </>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">{error}</div>
        )}

        {result && (
          <div className="space-y-6 pt-4">
            <section className="bg-white/5 border border-white/10 rounded-lg p-5">
              <h2 className="text-lg font-semibold mb-2">Summary</h2>
              <p className="text-white/80">{result.summary}</p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-lg p-5">
              <h2 className="text-lg font-semibold mb-2">Key Decisions</h2>
              <ul className="list-disc list-inside space-y-1 text-white/80">
                {(result.decisions ?? []).map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-lg p-5">
              <h2 className="text-lg font-semibold mb-2">Action Items</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-white/50 border-b border-white/10">
                    <th className="pb-2">What</th>
                    <th className="pb-2">Who</th>
                    <th className="pb-2">By when</th>
                  </tr>
                </thead>
                <tbody>
                  {(result.actions ?? []).map((a, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-2 text-white/80">{a.what}</td>
                      <td className="py-2 text-white/80">{a.who}</td>
                      <td className="py-2 text-white/80">{a.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-lg p-5">
              <h2 className="text-lg font-semibold mb-2">Follow-up Email</h2>
              <textarea
                readOnly
                value={result.followUpEmail}
                className="w-full min-h-[120px] bg-black/30 border border-white/10 rounded p-3 text-white/80 resize-y"
              />
            </section>

            <div className="flex items-center gap-3">
              <button
                onClick={copyAll}
                className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm transition-colors"
              >
                {copied ? 'Copied!' : 'Copy all as markdown'}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Transcribe another
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
