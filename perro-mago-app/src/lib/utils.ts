import { CURRENCY, TAX_RATE } from './constants';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: CURRENCY,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatDateShort(date: string | Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(new Date(date));
}

export function calculateSubtotal(items: { unitPrice: number; quantity: number; modifiersDelta: number }[]): number {
  return items.reduce((sum, item) => sum + (item.unitPrice + item.modifiersDelta) * item.quantity, 0);
}

export function calculateTax(subtotal: number): number {
  return Math.round(subtotal * TAX_RATE * 100) / 100;
}

export function calculateTotal(subtotal: number): number {
  return subtotal + calculateTax(subtotal);
}

export function getUnitLabel(unit: string): string {
  const labels: Record<string, string> = {
    g: 'gramos',
    ml: 'mililitros',
    unit: 'unidades',
  };
  return labels[unit] || unit;
}

export function getUnitAbbr(unit: string): string {
  const labels: Record<string, string> = {
    g: 'g',
    ml: 'ml',
    unit: 'uds',
  };
  return labels[unit] || unit;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  return crypto.randomUUID();
}
