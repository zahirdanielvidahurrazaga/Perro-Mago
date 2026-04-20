import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase, IS_DEMO_MODE } from '../lib/supabase';

/**
 * Subscribes to Supabase Realtime events.
 * Disabled in Demo Mode.
 */
export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (IS_DEMO_MODE) return;

    const channel = supabase
      .channel('perro-mago-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_items' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'restock_log' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

