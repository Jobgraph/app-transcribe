import { useState, useEffect } from 'react';
import { type AppConfig, loadConfig } from './config';

interface Structured {
  summary: string;
  decisions: string[];
  actions: { what: string; who: string; by: string }[];
  followUpEmail: string;
}

const MOCK_RESPONSE: Structured = {
  summary: 'The team discussed Q2 priorities, agreed on the new pricing model, and assigned ownership for the launch checklist.',
  decisions: [
    'Move to usage-based pricing starting June 1',
    'Deprecate the legacy dashboard by end of Q2',
    'Hire two additional engineers for the platform team',
  ],
  actions: [
    { what: 'Draft pricing page copy', who: 'Sarah', by: '2024-05-15' },
    { what: 'Set up usage metering pipeline', who: 'Dev team', by: '2024-05-20' },
    { what: 'Send deprecation notice to legacy users', who: 'Mark', by: '2024-05-10' },
  ],
  followUpEmail: `Hi team,\n\nThanks for a productive session. Here's a quick recap:\n\n- We're moving to usage-based pricing from June 1\n- Legacy dashboard will be deprecated by end of Q2\n- Two new engineers joining the platform team\n\nPlease check the action items assigned to you and flag any blockers by EOD Friday.\n\nBest,\n[Your name]`,
};

function toMarkdown(data: Structured): string {
  let md = `## Summary\n${data.summary}\n\n## Key Decisions\n`;
  data.decisions.forEach((d) => (md += `- ${d}\n`));
  md += `\n## Action Items\n| What | Who | By |\n|------|-----|----|\n`;
  data.actions.forEach((a) => (md += `| ${a.what} | ${a.who} | ${a.by} |\n`));
  md += `\n## Follow-up Email\n${data.followUpEmail}\n`;
  return md;
}

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [transcript, setTranscript] = useState('');
  const [result, setResult] = useState<Structured | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadConfig().then(setConfig);
  }, []);

  if (!config) return null;

  async function process() {
    setLoading(true);
    setResult(null);
    try {
      if (config!.deploymentId === 'local') {
        await new Promise((r) => setTimeout(r, 1500));
        setResult(MOCK_RESPONSE);
      } else {
        const res = await fetch(
          `https://app.jobgraph.com/api/apps/${config!.deploymentId}/process`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: transcript, type: 'transcribe' }),
          }
        );
        const { structured } = await res.json();
        setResult(structured);
      }
    } catch (err) {
      console.error(err);
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
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center gap-3">
        {config.logoUrl && (
          <img src={config.logoUrl} alt="" className="h-8 w-8 rounded" />
        )}
        <h1 className="text-xl font-semibold">{config.appName}</h1>
        <span className="text-sm text-white/50">{config.orgName}</span>
      </header>

      {/* Main */}
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

        {result && (
          <div className="space-y-6 pt-4">
            {/* Summary */}
            <section className="bg-white/5 border border-white/10 rounded-lg p-5">
              <h2 className="text-lg font-semibold mb-2">Summary</h2>
              <p className="text-white/80">{result.summary}</p>
            </section>

            {/* Decisions */}
            <section className="bg-white/5 border border-white/10 rounded-lg p-5">
              <h2 className="text-lg font-semibold mb-2">Key Decisions</h2>
              <ul className="list-disc list-inside space-y-1 text-white/80">
                {result.decisions.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </section>

            {/* Actions */}
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
                  {result.actions.map((a, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="py-2 text-white/80">{a.what}</td>
                      <td className="py-2 text-white/80">{a.who}</td>
                      <td className="py-2 text-white/80">{a.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* Follow-up email */}
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
