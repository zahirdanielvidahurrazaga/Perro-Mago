-- ============================================================================
-- PERRO MAGO — 003_seed_data.sql
-- Initial seed data: categories, inventory, products, recipes, modifiers
-- Execute this THIRD in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. CATEGORIES
-- ============================================================================
INSERT INTO categories (id, name, slug, display_order, icon) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Hamburguesas', 'hamburguesas', 1, 'beef'),
  ('a1000000-0000-0000-0000-000000000002', 'Complementos', 'complementos', 2, 'fries'),
  ('a1000000-0000-0000-0000-000000000003', 'Bebidas',      'bebidas',      3, 'cup-soda');

-- ============================================================================
-- 2. INVENTORY ITEMS (Raw Materials)
-- ============================================================================
INSERT INTO inventory_items (id, name, unit, current_stock, reorder_threshold, cost_per_unit) VALUES
  -- Bread & Packaging
  ('b1000000-0000-0000-0000-000000000001', 'Pan Brioche',               'unit', 200,    30,    8.50),
  ('b1000000-0000-0000-0000-000000000002', 'Empaque de Cartón',         'unit', 300,    40,    3.20),
  
  -- Proteins
  ('b1000000-0000-0000-0000-000000000003', 'Carne de Res',              'g',    50000,  5000,  0.18),
  ('b1000000-0000-0000-0000-000000000004', 'Tocino',                    'g',    3000,   500,   0.35),
  
  -- Cheese & Dairy
  ('b1000000-0000-0000-0000-000000000005', 'Queso Americano',           'unit', 500,    50,    4.00),
  
  -- Vegetables
  ('b1000000-0000-0000-0000-000000000006', 'Lechuga',                   'g',    5000,   500,   0.02),
  ('b1000000-0000-0000-0000-000000000007', 'Tomate',                    'g',    5000,   500,   0.03),
  ('b1000000-0000-0000-0000-000000000008', 'Cebolla',                   'g',    5000,   500,   0.02),
  ('b1000000-0000-0000-0000-000000000009', 'Pepinillos',                'g',    3000,   300,   0.05),
  
  -- Frozen sides
  ('b1000000-0000-0000-0000-000000000010', 'Papas Congeladas',          'g',    25000,  3000,  0.04),
  ('b1000000-0000-0000-0000-000000000011', 'Aros de Cebolla Congelados','g',    10000,  2000,  0.06),
  
  -- Beverages — Cups & Containers
  ('b1000000-0000-0000-0000-000000000012', 'Vaso Plástico 500ml',       'unit', 400,    50,    1.80),
  
  -- Beverages — Concentrates
  ('b1000000-0000-0000-0000-000000000013', 'Concentrado Maracuyá',      'ml',   5000,   1000,  0.12),
  ('b1000000-0000-0000-0000-000000000014', 'Concentrado Jamaica',       'ml',   5000,   1000,  0.10),
  ('b1000000-0000-0000-0000-000000000015', 'Concentrado Horchata',      'ml',   5000,   1000,  0.11),
  
  -- Beverages — Water
  ('b1000000-0000-0000-0000-000000000016', 'Agua Purificada',           'ml',   100000, 20000, 0.001),
  
  -- Beverages — Commercial
  ('b1000000-0000-0000-0000-000000000017', 'Coca-Cola lata',            'unit', 200,    30,    12.00),
  
  -- Sauces
  ('b1000000-0000-0000-0000-000000000018', 'Salsa BBQ',                 'ml',   3000,   500,   0.08),
  
  -- Sides packaging
  ('b1000000-0000-0000-0000-000000000019', 'Contenedor Papas/Aros',     'unit', 300,    40,    2.50);

-- ============================================================================
-- 3. PRODUCTS (Menu)
-- ============================================================================
INSERT INTO products (id, name, category_id, price, description, is_available, has_modifiers) VALUES
  -- Hamburguesas
  ('c1000000-0000-0000-0000-000000000001', 'Burger Especial',  'a1000000-0000-0000-0000-000000000001', 189.00, 'Carne premium 200g, tocino, doble queso, lechuga, tomate y cebolla en pan brioche artesanal',   true, true),
  ('c1000000-0000-0000-0000-000000000002', 'Burger Clásica',   'a1000000-0000-0000-0000-000000000001', 149.00, 'Carne 200g, queso americano, lechuga, tomate y cebolla en pan brioche',                         true, true),
  ('c1000000-0000-0000-0000-000000000003', 'Burger BBQ',       'a1000000-0000-0000-0000-000000000001', 199.00, 'Carne 200g, tocino crujiente, aros de cebolla, queso cheddar y salsa BBQ ahumada',              true, true),
  
  -- Complementos
  ('c1000000-0000-0000-0000-000000000004', 'Papas Fritas',     'a1000000-0000-0000-0000-000000000002',  69.00, 'Papas fritas crujientes con sazonador especial de la casa',                                     true, false),
  ('c1000000-0000-0000-0000-000000000005', 'Aros de Cebolla',  'a1000000-0000-0000-0000-000000000002',  79.00, 'Aros de cebolla crujientes con salsa ranch',                                                   true, false),
  
  -- Bebidas — Aguas Naturales
  ('c1000000-0000-0000-0000-000000000006', 'Agua Maracuyá',    'a1000000-0000-0000-0000-000000000003',  45.00, 'Agua fresca natural de maracuyá — 500ml',                                                      true, false),
  ('c1000000-0000-0000-0000-000000000007', 'Agua Jamaica',     'a1000000-0000-0000-0000-000000000003',  45.00, 'Agua fresca natural de jamaica — 500ml',                                                       true, false),
  ('c1000000-0000-0000-0000-000000000008', 'Agua Horchata',    'a1000000-0000-0000-0000-000000000003',  45.00, 'Agua fresca natural de horchata — 500ml',                                                      true, false),
  
  -- Bebidas — Comerciales
  ('c1000000-0000-0000-0000-000000000009', 'Coca-Cola',        'a1000000-0000-0000-0000-000000000003',  35.00, 'Coca-Cola lata 355ml',                                                                         true, false);

-- ============================================================================
-- 4. RECIPES (Bill of Materials)
-- ============================================================================

-- ── Burger Especial ──
INSERT INTO recipes (product_id, inventory_item_id, quantity_required) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 1),     -- 1 Pan Brioche
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000003', 200),   -- 200g Carne de Res
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000004', 20),    -- 20g Tocino
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000005', 2),     -- 2 Queso Americano
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000002', 1),     -- 1 Empaque de Cartón
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000006', 30),    -- 30g Lechuga
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000007', 40),    -- 40g Tomate
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000008', 20);    -- 20g Cebolla

-- ── Burger Clásica ──
INSERT INTO recipes (product_id, inventory_item_id, quantity_required) VALUES
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 1),     -- 1 Pan Brioche
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000003', 200),   -- 200g Carne de Res
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000005', 1),     -- 1 Queso Americano
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 1),     -- 1 Empaque de Cartón
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000006', 30),    -- 30g Lechuga
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000007', 40),    -- 40g Tomate
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000008', 20);    -- 20g Cebolla

-- ── Burger BBQ ──
INSERT INTO recipes (product_id, inventory_item_id, quantity_required) VALUES
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 1),     -- 1 Pan Brioche
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 200),   -- 200g Carne de Res
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000004', 30),    -- 30g Tocino
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000005', 2),     -- 2 Queso (cheddar style)
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000002', 1),     -- 1 Empaque de Cartón
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000011', 40),    -- 40g Aros de Cebolla
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000018', 30);    -- 30ml Salsa BBQ

-- ── Papas Fritas ──
INSERT INTO recipes (product_id, inventory_item_id, quantity_required) VALUES
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000010', 200),   -- 200g Papas Congeladas
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000019', 1);     -- 1 Contenedor

-- ── Aros de Cebolla ──
INSERT INTO recipes (product_id, inventory_item_id, quantity_required) VALUES
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000011', 150),   -- 150g Aros de Cebolla
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000019', 1);     -- 1 Contenedor

-- ── Agua Maracuyá ── (Simulación requerida 2)
INSERT INTO recipes (product_id, inventory_item_id, quantity_required) VALUES
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000012', 1),     -- 1 Vaso Plástico 500ml
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000013', 50),    -- 50ml Concentrado Maracuyá
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000016', 400);   -- 400ml Agua Purificada

-- ── Agua Jamaica ──
INSERT INTO recipes (product_id, inventory_item_id, quantity_required) VALUES
  ('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000012', 1),     -- 1 Vaso Plástico 500ml
  ('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000014', 50),    -- 50ml Concentrado Jamaica
  ('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000016', 400);   -- 400ml Agua Purificada

-- ── Agua Horchata ──
INSERT INTO recipes (product_id, inventory_item_id, quantity_required) VALUES
  ('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000012', 1),     -- 1 Vaso Plástico 500ml
  ('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000015', 50),    -- 50ml Concentrado Horchata
  ('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000016', 400);   -- 400ml Agua Purificada

-- ── Coca-Cola ──
INSERT INTO recipes (product_id, inventory_item_id, quantity_required) VALUES
  ('c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000017', 1);     -- 1 Coca-Cola lata

-- ============================================================================
-- 5. MODIFIER GROUPS
-- ============================================================================
INSERT INTO modifier_groups (id, name, selection_type, display_order) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'Término de la Carne', 'single',   1),
  ('d1000000-0000-0000-0000-000000000002', 'Quitar Ingredientes', 'multiple', 2),
  ('d1000000-0000-0000-0000-000000000003', 'Extras',              'multiple', 3);

-- ============================================================================
-- 6. PRODUCT MODIFIERS
-- ============================================================================
INSERT INTO product_modifiers (id, group_id, name, price_delta, inventory_item_id, inventory_delta, display_order) VALUES
  -- Término de la Carne (no inventory impact, just cooking instruction)
  ('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Término Medio', 0, NULL, 0, 1),
  ('e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', '3/4',           0, NULL, 0, 2),
  ('e1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'Bien Cocida',   0, NULL, 0, 3),
  
  -- Quitar Ingredientes (negative delta = saves ingredient, reduces deduction)
  ('e1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', 'Sin Cebolla',    0, 'b1000000-0000-0000-0000-000000000008', -20, 1),
  ('e1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000002', 'Sin Lechuga',    0, 'b1000000-0000-0000-0000-000000000006', -30, 2),
  ('e1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000002', 'Sin Tomate',     0, 'b1000000-0000-0000-0000-000000000007', -40, 3),
  ('e1000000-0000-0000-0000-000000000007', 'd1000000-0000-0000-0000-000000000002', 'Sin Pepinillos', 0, 'b1000000-0000-0000-0000-000000000009', -15, 4),
  
  -- Extras (positive delta = additional consumption, adds to price)
  ('e1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000003', 'Extra Queso',   20, 'b1000000-0000-0000-0000-000000000005',  2,   1),
  ('e1000000-0000-0000-0000-000000000009', 'd1000000-0000-0000-0000-000000000003', 'Extra Tocino',  25, 'b1000000-0000-0000-0000-000000000004',  20,  2),
  ('e1000000-0000-0000-0000-000000000010', 'd1000000-0000-0000-0000-000000000003', 'Extra Carne',   45, 'b1000000-0000-0000-0000-000000000003',  200, 3);

-- ============================================================================
-- SEED DATA COMPLETE!
-- ============================================================================
-- Summary:
--   • 3 Categories
--   • 19 Inventory Items  
--   • 9 Products (3 burgers, 2 sides, 4 drinks)
--   • 30 Recipes (BOM entries)
--   • 3 Modifier Groups
--   • 10 Product Modifiers
--
-- Simulation 1: "Burger Especial" deducts:
--   1 Pan Brioche, 200g Carne, 20g Tocino, 2 Queso, 1 Empaque, 30g Lechuga, 40g Tomate, 20g Cebolla
--
-- Simulation 2: "Agua NATURAL Maracuyá" deducts:
--   1 Vaso Plástico 500ml, 50ml Concentrado Maracuyá, 400ml Agua Purificada
-- ============================================================================
