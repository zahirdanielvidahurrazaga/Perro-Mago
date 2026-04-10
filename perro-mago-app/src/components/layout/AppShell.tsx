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
    <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden relative">
      {/* Mobile TopBar */}
      <div className="md:hidden flex items-center justify-center py-2 bg-surface-container-low border-b border-outline-variant/30 shrink-0">
        <div className="bg-white rounded-full p-0.5 shadow-sm">
          <img src="/logo.png" alt="Perro Mago Logo" className="h-10 w-10 object-contain rounded-full" />
        </div>
      </div>

      <Sidebar />
      
      <main className="flex-1 overflow-hidden pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
}
