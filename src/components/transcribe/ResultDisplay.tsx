import { motion } from 'framer-motion';
import { CheckCircle2, ListChecks, Users, Mail } from 'lucide-react';
import type { TranscriptResult } from '../../lib/types';
import { CopyButton } from '../shared/CopyButton';
import { ExportMenu } from '../shared/ExportMenu';

interface ResultDisplayProps {
  result: TranscriptResult;
}

const section = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

const container = {
  visible: { transition: { staggerChildren: 0.08 } },
};

export function ResultDisplay({ result }: ResultDisplayProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {/* Export bar */}
      <motion.div variants={section} className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">Results</h2>
        <ExportMenu result={result} />
      </motion.div>

      {/* Summary */}
      <motion.section variants={section} className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Summary</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
        <div className="mt-3">
          <CopyButton text={result.summary} label="Copy summary" />
        </div>
      </motion.section>

      {/* Decisions */}
      {result.decisions.length > 0 && (
        <motion.section variants={section} className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <ListChecks className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Key Decisions</h3>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {result.decisions.length}
            </span>
          </div>
          <ul className="space-y-2">
            {result.decisions.map((d, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="leading-relaxed">{d}</span>
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      {/* Actions */}
      {result.actions.length > 0 && (
        <motion.section variants={section} className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-5 pt-5 pb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Action Items</h3>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {result.actions.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-y border-border bg-muted/50">
                  <th className="text-left px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">What</th>
                  <th className="text-left px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Who</th>
                  <th className="text-left px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">By when</th>
                </tr>
              </thead>
              <tbody>
                {result.actions.map((a, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-2.5 text-foreground">{a.what}</td>
                    <td className="px-5 py-2.5 text-muted-foreground font-medium">{a.who}</td>
                    <td className="px-5 py-2.5 text-muted-foreground">{a.by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>
      )}

      {/* Follow-up email */}
      <motion.section variants={section} className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Follow-up Email</h3>
          </div>
          <CopyButton text={result.followUpEmail} label="Copy email" />
        </div>
        <pre className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans bg-muted/30 rounded-lg p-4 border border-border">
          {result.followUpEmail}
        </pre>
      </motion.section>
    </motion.div>
  );
}
