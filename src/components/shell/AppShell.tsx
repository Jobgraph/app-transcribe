import { useState, type ReactNode } from 'react';
import type { AppConfig } from '../../lib/config';
import type { HistoryEntry } from '../../lib/types';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  config: AppConfig;
  entries: HistoryEntry[];
  activeId: string | null;
  onSelectEntry: (id: string) => void;
  onNewEntry: () => void;
  onDeleteEntry: (id: string) => void;
  onClearAll: () => void;
  children: ReactNode;
}

export function AppShell({
  config,
  entries,
  activeId,
  onSelectEntry,
  onNewEntry,
  onDeleteEntry,
  onClearAll,
  children,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header config={config} onMenuClick={() => setMobileOpen(!mobileOpen)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:flex">
          <Sidebar
            entries={entries}
            activeId={activeId}
            onSelect={onSelectEntry}
            onNew={onNewEntry}
            onDelete={onDeleteEntry}
            onClearAll={onClearAll}
          />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 md:hidden">
              <Sidebar
                entries={entries}
                activeId={activeId}
                onSelect={(id) => { onSelectEntry(id); setMobileOpen(false); }}
                onNew={() => { onNewEntry(); setMobileOpen(false); }}
                onDelete={onDeleteEntry}
                onClearAll={onClearAll}
              />
            </div>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
