export interface AppConfig {
  deploymentId: string;
  appName: string;
  orgName: string;
  brandColour: string;
  logoUrl: string | null;
  systemPrompt: string;
  capabilities: string[];
  status: string;
  pilotEndsAt: string | null;
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
  status: 'active',
  pilotEndsAt: null,
  isConfigured: false,
};

let cached: AppConfig | null = null;

export async function loadConfig(): Promise<AppConfig> {
  if (cached) return cached;

  const injected = (window as any).__JOBGRAPH_CONFIG__;
  if (injected?.deploymentId) {
    const config: AppConfig = { ...DEFAULTS, ...injected, isConfigured: true };
    cached = config;
    return config;
  }

  const id = import.meta.env.VITE_DEPLOYMENT_ID;
  if (!id) return DEFAULTS;
  try {
    const res = await fetch(`https://app.jobgraph.com/api/apps/${id}/config`);
    if (!res.ok) return DEFAULTS;
    const config: AppConfig = { ...DEFAULTS, ...await res.json(), deploymentId: id, isConfigured: true };
    cached = config;
    return config;
  } catch {
    return DEFAULTS;
  }
}

export function _resetCache() { cached = null; }
