export interface AppConfig {
  deploymentId: string;
  appName: string;
  orgName: string;
  brandColour: string;
  logoUrl: string | null;
  systemPrompt: string;
  capabilities: string[];
  isConfigured: boolean;
}

const DEFAULTS: AppConfig = {
  deploymentId: 'local',
  appName: 'Transcribe',
  orgName: 'Your Organisation',
  brandColour: '#6366f1',
  logoUrl: null,
  systemPrompt: 'You are a meeting intelligence assistant.',
  capabilities: ['summary-templates'],
  isConfigured: false,
};

export async function loadConfig(): Promise<AppConfig> {
  // Cloudflare Worker injects config at the edge — use it directly
  const injected = (window as unknown as { __JOBGRAPH_CONFIG__?: Partial<AppConfig> }).__JOBGRAPH_CONFIG__;
  if (injected?.deploymentId) {
    return { ...DEFAULTS, ...injected, isConfigured: true };
  }
  // Local dev fallback: fetch via VITE_DEPLOYMENT_ID
  const id = import.meta.env.VITE_DEPLOYMENT_ID;
  if (!id) return DEFAULTS;
  try {
    const res = await fetch(`https://app.jobgraph.com/api/apps/${id}/config`);
    if (!res.ok) return { ...DEFAULTS, deploymentId: id };
    return { ...DEFAULTS, ...(await res.json()), deploymentId: id, isConfigured: true };
  } catch {
    return { ...DEFAULTS, deploymentId: id };
  }
}
