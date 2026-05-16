export interface AppConfig {
  deploymentId: string;
  appName: string;
  orgName: string;
  brandColour: string;
  logoUrl: string | null;
  systemPrompt: string;
  capabilities: string[];
  status?: 'ACTIVE' | 'PILOT' | 'EXPIRED' | 'PAUSED';
  pilotEndsAt?: string | null;
}

const DEFAULTS: AppConfig = {
  deploymentId: 'local',
  appName: 'Transcribe',
  orgName: 'Your Organisation',
  brandColour: '#6366f1',
  logoUrl: null,
  systemPrompt: 'You are a meeting intelligence assistant.',
  capabilities: ['summary-templates'],
  status: 'ACTIVE',
};

let cached: AppConfig | null = null;

export async function loadConfig(): Promise<AppConfig> {
  if (cached) return cached;
  const id = import.meta.env.VITE_DEPLOYMENT_ID;
  if (!id) {
    cached = DEFAULTS;
    return DEFAULTS;
  }
  try {
    const res = await fetch(`https://app.jobgraph.com/api/apps/${id}/config`);
    if (!res.ok) {
      cached = DEFAULTS;
      return DEFAULTS;
    }
    const result: AppConfig = { ...DEFAULTS, ...(await res.json()), deploymentId: id };
    cached = result;
    return result;
  } catch {
    cached = DEFAULTS;
    return DEFAULTS;
  }
}
