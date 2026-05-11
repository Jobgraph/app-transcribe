import { useState, useEffect } from 'react';
import { type AppConfig, loadConfig } from './config';

interface Structured {
  summary: string;
  decisions: string[];
  actions: { what: string; who: string; by: string }[];
  followUpEmail: string;
}

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

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [transcript, setTranscript] = useState('');
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

  async function process() {
    setLoading(true);
    setResult(null);
    setError('');
    try {
      const res = await fetch(
        `https://app.jobgraph.com/api/apps/${config!.deploymentId}/process`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input: transcript, type: 'transcribe' }),
        }
      );
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const { structured } = await res.json();
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
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Paste your meeting transcript here..."
          className="w-full min-h-[200px] bg-white/5 border border-white/10 rounded-lg p-4 resize-y focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <button
          onClick={process}
          disabled={loading || !transcript.trim()}
          style={{ backgroundColor: config.brandColour }}
          className="px-6 py-2.5 rounded-lg font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Analysing...
            </span>
          ) : (
            'Process transcript'
          )}
        </button>

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

            <button
              onClick={copyAll}
              className="px-4 py-2 bg-white/10 hover:bg-white/15 rounded-lg text-sm transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy all as markdown'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
