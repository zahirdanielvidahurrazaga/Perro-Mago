import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useRealtimeSync } from '../../hooks/useRealtimeSync';
import { IS_DEMO_MODE } from '../../lib/supabase';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  // Global realtime sync
  useRealtimeSync();

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background overflow-hidden relative">
      {IS_DEMO_MODE && (
        <div className="fixed top-2 right-2 z-50 bg-primary/20 text-primary text-[10px] uppercase font-bold px-2 py-1 rounded border border-primary/30 backdrop-blur-sm pointer-events-none">
          Demo Mode
        </div>
      )}

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
