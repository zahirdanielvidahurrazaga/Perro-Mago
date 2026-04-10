export const TAX_RATE = 0.16; // IVA 16%
export const CURRENCY = 'MXN';
export const RESTAURANT_NAME = 'Perro Mago';
export const RESTAURANT_TAGLINE = 'Hamburguesas Gourmet';
export const TICKET_FOOTER = '¡Gracias por tu preferencia! 🐾✨\nSíguenos en @PerroMago';
export const TICKET_WIDTH_MM = 80;

export const DATE_FILTERS = [
  { label: 'Hoy', value: 'today' },
  { label: 'Ayer', value: 'yesterday' },
  { label: '7 Días', value: 'last7days' },
  { label: 'Este Mes', value: 'thisMonth' },
  { label: 'Personalizado', value: 'custom' },
] as const;

export type DateFilterValue = (typeof DATE_FILTERS)[number]['value'];

export const CATEGORY_COLORS: Record<string, string> = {
  'Hamburguesas': '#F6BE39',
  'Complementos': '#A9C7FF',
  'Bebidas': '#10B981',
};
