import type { TranscriptResult } from './types';

export function toMarkdown(data: TranscriptResult): string {
  let md = `## Summary\n\n${data.summary}\n\n## Key Decisions\n\n`;
  data.decisions.forEach((d) => (md += `- ${d}\n`));
  md += `\n## Action Items\n\n| What | Who | By |\n|------|-----|----|\n`;
  data.actions.forEach((a) => (md += `| ${a.what} | ${a.who} | ${a.by} |\n`));
  md += `\n## Follow-up Email\n\n${data.followUpEmail}\n`;
  return md;
}

export async function copyAsMarkdown(data: TranscriptResult): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(toMarkdown(data));
    return true;
  } catch {
    return false;
  }
}

export async function copyAsText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function downloadMarkdown(data: TranscriptResult, filename = 'transcript-summary.md') {
  const blob = new Blob([toMarkdown(data)], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
