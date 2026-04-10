import { create } from 'zustand';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';
import type { DateFilterValue } from '../lib/constants';

interface DateRange {
  start: Date;
  end: Date;
}

interface DateFilterStore {
  activeFilter: DateFilterValue;
  customRange: DateRange | null;
  setFilter: (filter: DateFilterValue) => void;
  setCustomRange: (start: Date, end: Date) => void;
  getDateRange: () => DateRange;
  getPreviousRange: () => DateRange;
}

function getRange(filter: DateFilterValue, customRange: DateRange | null): DateRange {
  const now = new Date();
  switch (filter) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'yesterday': {
      const yesterday = subDays(now, 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    }
    case 'last7days':
      return { start: startOfDay(subDays(now, 6)), end: endOfDay(now) };
    case 'thisMonth':
      return { start: startOfMonth(now), end: endOfDay(now) };
    case 'custom':
      return customRange || { start: startOfDay(now), end: endOfDay(now) };
    default:
      return { start: startOfDay(now), end: endOfDay(now) };
  }
}

function getPrev(filter: DateFilterValue, customRange: DateRange | null): DateRange {
  const now = new Date();
  switch (filter) {
    case 'today': {
      const yesterday = subDays(now, 1);
      return { start: startOfDay(yesterday), end: endOfDay(yesterday) };
    }
    case 'yesterday': {
      const dayBefore = subDays(now, 2);
      return { start: startOfDay(dayBefore), end: endOfDay(dayBefore) };
    }
    case 'last7days':
      return { start: startOfDay(subDays(now, 13)), end: endOfDay(subDays(now, 7)) };
    case 'thisMonth': {
      const prevMonth = subDays(startOfMonth(now), 1);
      return { start: startOfMonth(prevMonth), end: endOfMonth(prevMonth) };
    }
    case 'custom': {
      const range = customRange || { start: startOfDay(now), end: endOfDay(now) };
      const diff = range.end.getTime() - range.start.getTime();
      return {
        start: new Date(range.start.getTime() - diff),
        end: new Date(range.end.getTime() - diff),
      };
    }
    default:
      return { start: startOfDay(subDays(now, 1)), end: endOfDay(subDays(now, 1)) };
  }
}

export const useDateFilterStore = create<DateFilterStore>((set, get) => ({
  activeFilter: 'today',
  customRange: null,
  setFilter: (filter) => set({ activeFilter: filter }),
  setCustomRange: (start, end) => set({ customRange: { start, end }, activeFilter: 'custom' }),
  getDateRange: () => getRange(get().activeFilter, get().customRange),
  getPreviousRange: () => getPrev(get().activeFilter, get().customRange),
}));
