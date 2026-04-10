-- ============================================================================
-- PERRO MAGO — 001_create_schema.sql
-- Complete database schema for POS & ERP system
-- Execute this FIRST in Supabase SQL Editor
-- ============================================================================

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. CATEGORIES
-- ============================================================================
CREATE TABLE categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  display_order INT NOT NULL DEFAULT 0,
  icon       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE categories IS 'Product categories for the POS menu (Hamburguesas, Complementos, Bebidas)';

-- ============================================================================
-- 2. INVENTORY ITEMS (Raw Materials / Insumos)
-- ============================================================================
CREATE TABLE inventory_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL UNIQUE,
  unit              TEXT NOT NULL CHECK (unit IN ('g', 'ml', 'unit')),
  current_stock     NUMERIC(12,2) NOT NULL DEFAULT 0,
  reorder_threshold NUMERIC(12,2) NOT NULL DEFAULT 0,
  cost_per_unit     NUMERIC(10,4) NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE inventory_items IS 'Raw materials and supplies with stock tracking and reorder thresholds';

-- Index for fast low-stock queries
CREATE INDEX idx_inventory_low_stock 
  ON inventory_items (current_stock, reorder_threshold) 
  WHERE current_stock <= reorder_threshold;

-- ============================================================================
-- 3. PRODUCTS (Menu Items)
-- ============================================================================
CREATE TABLE products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  category_id   UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  description   TEXT,
  image_url     TEXT,
  is_available  BOOLEAN NOT NULL DEFAULT true,
  has_modifiers BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE products IS 'Final products sold in the POS terminal';

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_available ON products(is_available) WHERE is_available = true;

-- ============================================================================
-- 4. RECIPES (Bill of Materials — BOM)
-- ============================================================================
CREATE TABLE recipes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
  quantity_required NUMERIC(10,2) NOT NULL CHECK (quantity_required > 0),
  
  UNIQUE (product_id, inventory_item_id)
);

COMMENT ON TABLE recipes IS 'Pivot table connecting Products to their required InventoryItems (BOM)';

CREATE INDEX idx_recipes_product ON recipes(product_id);
CREATE INDEX idx_recipes_inventory ON recipes(inventory_item_id);

-- ============================================================================
-- 5. MODIFIER GROUPS
-- ============================================================================
CREATE TABLE modifier_groups (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  selection_type TEXT NOT NULL CHECK (selection_type IN ('single', 'multiple')),
  display_order  INT NOT NULL DEFAULT 0
);

COMMENT ON TABLE modifier_groups IS 'Groups of modifiers (Término, Quitar Ingredientes, Extras)';

-- ============================================================================
-- 6. PRODUCT MODIFIERS
-- ============================================================================
CREATE TABLE product_modifiers (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id          UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  price_delta       NUMERIC(10,2) NOT NULL DEFAULT 0,
  inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,
  inventory_delta   NUMERIC(10,2) NOT NULL DEFAULT 0,
  display_order     INT NOT NULL DEFAULT 0
);

COMMENT ON TABLE product_modifiers IS 'Individual modifier options with price and inventory impact';
COMMENT ON COLUMN product_modifiers.inventory_delta IS 'Positive = extra consumption, Negative = saves ingredient (e.g. Sin Cebolla saves 20g)';

CREATE INDEX idx_modifiers_group ON product_modifiers(group_id);

-- ============================================================================
-- 7. ORDERS
-- ============================================================================
CREATE TABLE orders (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  folio          TEXT UNIQUE NOT NULL,
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'card')),
  subtotal       NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
  tax_amount     NUMERIC(10,2) NOT NULL CHECK (tax_amount >= 0),
  total          NUMERIC(10,2) NOT NULL CHECK (total >= 0),
  cash_received  NUMERIC(10,2),
  change_amount  NUMERIC(10,2),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at        TIMESTAMPTZ
);

COMMENT ON TABLE orders IS 'Sales orders with payment tracking';

CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_paid ON orders(paid_at DESC) WHERE status = 'paid';

-- ============================================================================
-- 8. ORDER ITEMS
-- ============================================================================
CREATE TABLE order_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity   INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  notes      TEXT
);

COMMENT ON TABLE order_items IS 'Individual line items within an order';

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- ============================================================================
-- 9. ORDER ITEM MODIFIERS
-- ============================================================================
CREATE TABLE order_item_modifiers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  modifier_id   UUID NOT NULL REFERENCES product_modifiers(id) ON DELETE RESTRICT,
  price_delta   NUMERIC(10,2) NOT NULL
);

COMMENT ON TABLE order_item_modifiers IS 'Modifiers applied to specific order items (frozen at time of sale)';

CREATE INDEX idx_oim_order_item ON order_item_modifiers(order_item_id);

-- ============================================================================
-- 10. RESTOCK LOG
-- ============================================================================
CREATE TABLE restock_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_added    NUMERIC(12,2) NOT NULL CHECK (quantity_added > 0),
  previous_stock    NUMERIC(12,2) NOT NULL,
  new_stock         NUMERIC(12,2) NOT NULL,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE restock_log IS 'Audit trail for inventory restocking events';

CREATE INDEX idx_restock_item ON restock_log(inventory_item_id);
CREATE INDEX idx_restock_date ON restock_log(created_at DESC);

-- ============================================================================
-- 11. AUTO-UPDATE updated_at TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_inventory_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 12. FOLIO SEQUENCE (Auto-generate order folios)
-- ============================================================================
CREATE SEQUENCE order_folio_seq START WITH 1;

CREATE OR REPLACE FUNCTION generate_order_folio()
RETURNS TRIGGER AS $$
BEGIN
  NEW.folio := 'PM-' || TO_CHAR(now(), 'YYYYMMDD') || '-' || LPAD(nextval('order_folio_seq')::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_order_folio
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.folio IS NULL OR NEW.folio = '')
  EXECUTE FUNCTION generate_order_folio();

-- ============================================================================
-- 13. ENABLE ROW LEVEL SECURITY (Permissive for v1)
-- ============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE restock_log ENABLE ROW LEVEL SECURITY;

-- Permissive policies for v1 (internal network, no auth required)
-- Uses anon key — all operations allowed
CREATE POLICY "anon_all_categories" ON categories FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_inventory" ON inventory_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_products" ON products FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_recipes" ON recipes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_modifier_groups" ON modifier_groups FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_modifiers" ON product_modifiers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_orders" ON orders FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_order_items" ON order_items FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_oim" ON order_item_modifiers FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all_restock" ON restock_log FOR ALL TO anon USING (true) WITH CHECK (true);

-- ============================================================================
-- 14. ENABLE REALTIME
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE restock_log;

-- ============================================================================
-- DONE! Run 002_create_rpc.sql next.
-- ============================================================================
