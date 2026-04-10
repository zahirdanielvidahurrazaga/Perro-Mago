import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppShell } from './components/layout/AppShell';
import { POSView } from './components/pos/POSView';
import { DashboardView } from './components/dashboard/DashboardView';
import { InventoryView } from './components/inventory/InventoryView';
import { OrderHistoryView } from './components/history/OrderHistoryView';
import { PrintTicket } from './components/ticket/PrintTicket';
import { useUIStore } from './stores/useUIStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: true,
      staleTime: 30 * 1000,
    },
  },
});

function AppContent() {
  const activePage = useUIStore((s) => s.activePage);

  return (
    <AppShell>
      {activePage === 'pos' && <POSView />}
      {activePage === 'dashboard' && <DashboardView />}
      {activePage === 'inventory' && <InventoryView />}
      {activePage === 'history' && <OrderHistoryView />}
      
      {/* Hidden print ticket — rendered globally */}
      <PrintTicket />
    </AppShell>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#201F1F',
            color: '#E5E2E1',
            border: '1px solid rgba(79, 70, 52, 0.3)',
            borderRadius: '12px',
          },
        }}
      />
    </QueryClientProvider>
  );
}
