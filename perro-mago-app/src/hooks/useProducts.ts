import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { Product, Category, ModifierGroup } from '../types/database';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('is_available', true)
        .order('name');
      
      if (error) throw error;
      return data as (Product & { category: Category })[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      return data as Category[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useModifierGroups() {
  return useQuery({
    queryKey: ['modifier-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('modifier_groups')
        .select('*, modifiers:product_modifiers(*)')
        .order('display_order');

      if (error) throw error;
      return data as (ModifierGroup & { modifiers: import('../types/database').ProductModifier[] })[];
    },
    staleTime: 10 * 60 * 1000,
  });
}
