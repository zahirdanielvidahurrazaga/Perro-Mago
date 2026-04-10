/** 
 * Database types for Supabase.
 * These mirror the schema defined in 001_create_schema.sql
 */

export type UnitType = 'g' | 'ml' | 'unit';
export type OrderStatus = 'pending' | 'paid' | 'cancelled';
export type PaymentMethod = 'cash' | 'card';
export type SelectionType = 'single' | 'multiple';

export interface Category {
  id: string;
  name: string;
  slug: string;
  display_order: number;
  icon: string | null;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  unit: UnitType;
  current_stock: number;
  reorder_threshold: number;
  cost_per_unit: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  price: number;
  description: string | null;
  image_url: string | null;
  is_available: boolean;
  has_modifiers: boolean;
  created_at: string;
  category?: Category;
}

export interface Recipe {
  id: string;
  product_id: string;
  inventory_item_id: string;
  quantity_required: number;
  inventory_item?: InventoryItem;
}

export interface ModifierGroup {
  id: string;
  name: string;
  selection_type: SelectionType;
  display_order: number;
  modifiers?: ProductModifier[];
}

export interface ProductModifier {
  id: string;
  group_id: string;
  name: string;
  price_delta: number;
  inventory_item_id: string | null;
  inventory_delta: number;
  display_order: number;
  group?: ModifierGroup;
}

export interface Order {
  id: string;
  folio: string;
  status: OrderStatus;
  payment_method: PaymentMethod | null;
  subtotal: number;
  tax_amount: number;
  total: number;
  cash_received: number | null;
  change_amount: number | null;
  created_at: string;
  paid_at: string | null;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  notes: string | null;
  product?: Product;
  modifiers?: OrderItemModifier[];
}

export interface OrderItemModifier {
  id: string;
  order_item_id: string;
  modifier_id: string;
  price_delta: number;
  modifier?: ProductModifier;
}

export interface RestockLog {
  id: string;
  inventory_item_id: string;
  quantity_added: number;
  previous_stock: number;
  new_stock: number;
  notes: string | null;
  created_at: string;
  inventory_item?: InventoryItem;
}

export interface PaymentResult {
  success: boolean;
  order_id?: string;
  folio?: string;
  total?: number;
  method?: PaymentMethod;
  change?: number;
  error?: string;
}

export interface RestockResult {
  success: boolean;
  item_name?: string;
  previous_stock?: number;
  added?: number;
  new_stock?: number;
  error?: string;
}

export interface DashboardKPIs {
  total_sales: number;
  order_count: number;
  average_ticket: number;
  prev_sales: number;
  growth_pct: number;
}

// Simplified Database type — we use supabase-js without strict generics
// to avoid complex type issues with .rpc() calls. Type safety is handled
// at the application layer via our interfaces above.
export type Database = Record<string, unknown>;
