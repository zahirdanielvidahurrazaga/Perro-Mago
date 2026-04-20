import { useQuery } from '@tanstack/react-query';
import { supabase, IS_DEMO_MODE } from '../lib/supabase';
import { mockDataService } from '../lib/mockData';
import type { InventoryItem } from '../types/database';

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      if (IS_DEMO_MODE) return mockDataService.getInventory();

      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as InventoryItem[];
    },
    staleTime: 30 * 1000, 
  });
}

export function useLowStockItems() {
  return useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: async () => {
      if (IS_DEMO_MODE) {
        const all = await mockDataService.getInventory();
        return all.filter(item => item.current_stock <= item.reorder_threshold);
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .filter('current_stock', 'lte', 'reorder_threshold' as unknown as number)
        .order('current_stock');
      
      if (error) {
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

