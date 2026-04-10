import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  // Global realtime sync
  useRealtimeSync();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
