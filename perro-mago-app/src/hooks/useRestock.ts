import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, IS_DEMO_MODE } from '../lib/supabase';
import { mockDataService } from '../lib/mockData';
import { useUIStore } from '../stores/useUIStore';

export function useRestock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      inventoryItemId,
      quantityAdded,
      notes,
    }: {
      inventoryItemId: string;
      quantityAdded: number;
      notes?: string;
    }) => {
      if (IS_DEMO_MODE) return mockDataService.restockInventory(inventoryItemId, quantityAdded, notes);

      const { data, error } = await supabase.rpc('restock_inventory', {
        p_inventory_item_id: inventoryItemId,
        p_quantity_added: quantityAdded,
        p_notes: notes ?? null,
      } as Record<string, unknown>);

      if (error) throw error;

      const result = data as unknown as { success: boolean; error?: string; item_name?: string; new_stock?: number };
      if (!result.success) {
        throw new Error(result.error || 'Restock failed');
      }

      return result;
    },
    onSuccess: () => {
      const closeRestockModal = useUIStore.getState().closeRestockModal;
      closeRestockModal();
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

