import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { InventoryItem } from '../types/database';

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as InventoryItem[];
    },
    staleTime: 30 * 1000, // 30 seconds — refreshed frequently via realtime
  });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .filter('current_stock', 'lte', 'reorder_threshold' as unknown as number)
        .order('current_stock');
      
      if (error) {
        // Fallback: fetch all and filter client-side
        const { data: all, error: e2 } = await supabase
          .from('inventory_items')
          .select('*')
          .order('current_stock');
        if (e2) throw e2;
        return (all as InventoryItem[]).filter(
          (item) => item.current_stock <= item.reorder_threshold
        );
      }
      return data as InventoryItem[];
    },
    staleTime: 30 * 1000,
  });
}
