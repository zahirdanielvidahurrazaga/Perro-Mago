import { useQuery } from '@tanstack/react-query';
import { supabase, IS_DEMO_MODE } from '../lib/supabase';
import { mockDataService } from '../lib/mockData';
import { useDateFilterStore } from '../stores/useDateFilterStore';
import type { DashboardKPIs } from '../types/database';

export function useDashboardKPIs() {
  const getDateRange = useDateFilterStore((s) => s.getDateRange);
  const getPreviousRange = useDateFilterStore((s) => s.getPreviousRange);
  const activeFilter = useDateFilterStore((s) => s.activeFilter);

  const range = getDateRange();
  const prev = getPreviousRange();

  return useQuery({
    queryKey: ['dashboard', 'kpis', activeFilter, range.start.toISOString()],
    queryFn: async () => {
      if (IS_DEMO_MODE) return mockDataService.getDashboardKPIs();

      const { data, error } = await supabase.rpc('get_dashboard_kpis', {
        p_start_date: range.start.toISOString(),
        p_end_date: range.end.toISOString(),
        p_prev_start: prev.start.toISOString(),
        p_prev_end: prev.end.toISOString(),
      } as Record<string, unknown>);

      if (error) throw error;
      return data as unknown as DashboardKPIs;
    },
    staleTime: 60 * 1000,
  });
}

export function useSalesByHour() {
  const getDateRange = useDateFilterStore((s) => s.getDateRange);
  const activeFilter = useDateFilterStore((s) => s.activeFilter);
  const range = getDateRange();

  return useQuery({
    queryKey: ['dashboard', 'sales-by-hour', activeFilter, range.start.toISOString()],
    queryFn: async () => {
      if (IS_DEMO_MODE) return mockDataService.getSalesByHour();

      const { data, error } = await supabase.rpc('get_sales_by_hour', {
        p_start_date: range.start.toISOString(),
        p_end_date: range.end.toISOString(),
      } as Record<string, unknown>);

      if (error) throw error;

      const hourMap = new Map<number, { hour: number; total_sales: number; order_count: number }>();
      for (let h = 10; h <= 22; h++) {
        hourMap.set(h, { hour: h, total_sales: 0, order_count: 0 });
      }
      (data as { hour: number; total_sales: number; order_count: number }[])?.forEach((row) => {
        hourMap.set(row.hour, row);
      });

      return Array.from(hourMap.values()).sort((a, b) => a.hour - b.hour);
    },
    staleTime: 60 * 1000,
  });
}

export function useSalesByCategory() {
  const getDateRange = useDateFilterStore((s) => s.getDateRange);
  const activeFilter = useDateFilterStore((s) => s.activeFilter);
  const range = getDateRange();

  return useQuery({
    queryKey: ['dashboard', 'sales-by-category', activeFilter, range.start.toISOString()],
    queryFn: async () => {
      if (IS_DEMO_MODE) return mockDataService.getSalesByCategory();

      const { data, error } = await supabase.rpc('get_sales_by_category', {
        p_start_date: range.start.toISOString(),
        p_end_date: range.end.toISOString(),
      } as Record<string, unknown>);

      if (error) throw error;
      return data as unknown as { category_name: string; total_sales: number; item_count: number }[];
    },
    staleTime: 60 * 1000,
  });
}

export function useTopProducts() {
  const getDateRange = useDateFilterStore((s) => s.getDateRange);
  const activeFilter = useDateFilterStore((s) => s.activeFilter);
  const range = getDateRange();

  return useQuery({
    queryKey: ['dashboard', 'top-products', activeFilter, range.start.toISOString()],
    queryFn: async () => {
      if (IS_DEMO_MODE) return mockDataService.getTopProducts();

      const { data, error } = await supabase.rpc('get_top_products', {
        p_start_date: range.start.toISOString(),
        p_end_date: range.end.toISOString(),
        p_limit: 5,
      } as Record<string, unknown>);

      if (error) throw error;
      return data as unknown as { product_name: string; category_name: string; units_sold: number; total_revenue: number }[];
    },
    staleTime: 60 * 1000,
  });
}

