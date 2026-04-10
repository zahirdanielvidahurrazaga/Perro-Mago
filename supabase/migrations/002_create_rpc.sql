-- ============================================================================
-- PERRO MAGO — 002_create_rpc.sql
-- RPC Functions for atomic operations
-- Execute this SECOND in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. PROCESS ORDER PAYMENT (Atomic inventory deduction)
-- ============================================================================
CREATE OR REPLACE FUNCTION process_order_payment(
  p_order_id       UUID,
  p_payment_method TEXT,
  p_cash_received  NUMERIC DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order   RECORD;
  v_item    RECORD;
  v_modifier RECORD;
  v_recipe  RECORD;
  v_change  NUMERIC := 0;
BEGIN
  -- 1. Lock the order row to prevent double-payment (pessimistic lock)
  SELECT * INTO v_order 
  FROM orders 
  WHERE id = p_order_id 
  FOR UPDATE;
  
  IF v_order IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Order not found');
  END IF;
  
  IF v_order.status != 'pending' THEN
    RETURN json_build_object('success', false, 'error', 'Order already processed: ' || v_order.status);
  END IF;

  -- 2. Validate cash payment
  IF p_payment_method = 'cash' THEN
    IF p_cash_received IS NULL THEN
      RETURN json_build_object('success', false, 'error', 'Cash amount is required for cash payments');
    END IF;
    v_change := p_cash_received - v_order.total;
    IF v_change < 0 THEN
      RETURN json_build_object(
        'success', false, 
        'error', format('Insufficient cash: received %s, total %s', p_cash_received, v_order.total)
      );
    END IF;
  END IF;

  -- 3. Deduct inventory based on recipes for each order item
  FOR v_item IN 
    SELECT oi.product_id, oi.quantity, oi.id AS order_item_id
    FROM order_items oi 
    WHERE oi.order_id = p_order_id
  LOOP
    -- 3a. Deduct base recipe ingredients × order quantity
    FOR v_recipe IN
      SELECT r.inventory_item_id, r.quantity_required
      FROM recipes r
      WHERE r.product_id = v_item.product_id
    LOOP
      UPDATE inventory_items
      SET current_stock = current_stock - (v_recipe.quantity_required * v_item.quantity)
      WHERE id = v_recipe.inventory_item_id;
    END LOOP;

    -- 3b. Apply modifier inventory deltas (extras add consumption, "sin" reduces it)
    FOR v_modifier IN
      SELECT pm.inventory_item_id, pm.inventory_delta
      FROM order_item_modifiers oim
      JOIN product_modifiers pm ON pm.id = oim.modifier_id
      WHERE oim.order_item_id = v_item.order_item_id
        AND pm.inventory_item_id IS NOT NULL
        AND pm.inventory_delta != 0
    LOOP
      -- inventory_delta > 0 means EXTRA consumption (e.g., Extra Queso = +2 units)
      -- inventory_delta < 0 means SAVED ingredient (e.g., Sin Cebolla = -20g saved)
      -- We SUBTRACT the delta: extra = more deduction, sin = less deduction
      UPDATE inventory_items
      SET current_stock = current_stock - (v_modifier.inventory_delta * v_item.quantity)
      WHERE id = v_modifier.inventory_item_id;
    END LOOP;
  END LOOP;

  -- 4. Update order status to paid
  UPDATE orders
  SET status         = 'paid',
      payment_method = p_payment_method,
      cash_received  = p_cash_received,
      change_amount  = CASE WHEN p_payment_method = 'cash' THEN v_change ELSE NULL END,
      paid_at        = now()
  WHERE id = p_order_id;

  -- 5. Return success with order details
  RETURN json_build_object(
    'success',   true,
    'order_id',  p_order_id,
    'folio',     v_order.folio,
    'total',     v_order.total,
    'method',    p_payment_method,
    'change',    COALESCE(v_change, 0)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error',   SQLERRM
    );
END;
$$;

COMMENT ON FUNCTION process_order_payment IS 'Atomically processes a payment: validates, deducts inventory via BOM, and marks order as paid';

-- ============================================================================
-- 2. RESTOCK INVENTORY ITEM (with audit log)
-- ============================================================================
CREATE OR REPLACE FUNCTION restock_inventory(
  p_inventory_item_id UUID,
  p_quantity_added    NUMERIC,
  p_notes             TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item       RECORD;
  v_new_stock  NUMERIC;
BEGIN
  -- Lock the inventory row
  SELECT * INTO v_item
  FROM inventory_items
  WHERE id = p_inventory_item_id
  FOR UPDATE;

  IF v_item IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Inventory item not found');
  END IF;

  IF p_quantity_added <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'Quantity must be positive');
  END IF;

  v_new_stock := v_item.current_stock + p_quantity_added;

  -- Update stock
  UPDATE inventory_items
  SET current_stock = v_new_stock
  WHERE id = p_inventory_item_id;

  -- Log the restock event
  INSERT INTO restock_log (inventory_item_id, quantity_added, previous_stock, new_stock, notes)
  VALUES (p_inventory_item_id, p_quantity_added, v_item.current_stock, v_new_stock, p_notes);

  RETURN json_build_object(
    'success',        true,
    'item_name',      v_item.name,
    'previous_stock', v_item.current_stock,
    'added',          p_quantity_added,
    'new_stock',      v_new_stock
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

COMMENT ON FUNCTION restock_inventory IS 'Atomically restocks an inventory item and logs the event in restock_log';

-- ============================================================================
-- 3. DASHBOARD AGGREGATION: Sales by Hour
-- ============================================================================
CREATE OR REPLACE FUNCTION get_sales_by_hour(
  p_start_date TIMESTAMPTZ,
  p_end_date   TIMESTAMPTZ
)
RETURNS TABLE (hour INT, total_sales NUMERIC, order_count BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    EXTRACT(HOUR FROM o.paid_at)::INT AS hour,
    COALESCE(SUM(o.total), 0) AS total_sales,
    COUNT(*) AS order_count
  FROM orders o
  WHERE o.status = 'paid'
    AND o.paid_at >= p_start_date
    AND o.paid_at < p_end_date
  GROUP BY EXTRACT(HOUR FROM o.paid_at)
  ORDER BY hour;
$$;

-- ============================================================================
-- 4. DASHBOARD AGGREGATION: Sales by Category
-- ============================================================================
CREATE OR REPLACE FUNCTION get_sales_by_category(
  p_start_date TIMESTAMPTZ,
  p_end_date   TIMESTAMPTZ
)
RETURNS TABLE (category_name TEXT, total_sales NUMERIC, item_count BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    c.name AS category_name,
    COALESCE(SUM(oi.unit_price * oi.quantity), 0) AS total_sales,
    COALESCE(SUM(oi.quantity), 0) AS item_count
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  JOIN categories c ON c.id = p.category_id
  JOIN orders o ON o.id = oi.order_id
  WHERE o.status = 'paid'
    AND o.paid_at >= p_start_date
    AND o.paid_at < p_end_date
  GROUP BY c.name
  ORDER BY total_sales DESC;
$$;

-- ============================================================================
-- 5. DASHBOARD AGGREGATION: Top Products
-- ============================================================================
CREATE OR REPLACE FUNCTION get_top_products(
  p_start_date TIMESTAMPTZ,
  p_end_date   TIMESTAMPTZ,
  p_limit      INT DEFAULT 5
)
RETURNS TABLE (product_name TEXT, category_name TEXT, units_sold BIGINT, total_revenue NUMERIC)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.name AS product_name,
    c.name AS category_name,
    COALESCE(SUM(oi.quantity), 0) AS units_sold,
    COALESCE(SUM(oi.unit_price * oi.quantity), 0) AS total_revenue
  FROM order_items oi
  JOIN products p ON p.id = oi.product_id
  JOIN categories c ON c.id = p.category_id
  JOIN orders o ON o.id = oi.order_id
  WHERE o.status = 'paid'
    AND o.paid_at >= p_start_date
    AND o.paid_at < p_end_date
  GROUP BY p.name, c.name
  ORDER BY units_sold DESC
  LIMIT p_limit;
$$;

-- ============================================================================
-- 6. DASHBOARD AGGREGATION: KPIs
-- ============================================================================
CREATE OR REPLACE FUNCTION get_dashboard_kpis(
  p_start_date     TIMESTAMPTZ,
  p_end_date       TIMESTAMPTZ,
  p_prev_start     TIMESTAMPTZ,
  p_prev_end       TIMESTAMPTZ
)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_sales   NUMERIC;
  v_current_orders  BIGINT;
  v_current_avg     NUMERIC;
  v_prev_sales      NUMERIC;
  v_growth          NUMERIC;
BEGIN
  -- Current period
  SELECT 
    COALESCE(SUM(total), 0),
    COUNT(*),
    COALESCE(AVG(total), 0)
  INTO v_current_sales, v_current_orders, v_current_avg
  FROM orders
  WHERE status = 'paid'
    AND paid_at >= p_start_date
    AND paid_at < p_end_date;

  -- Previous period (for growth comparison)
  SELECT COALESCE(SUM(total), 0)
  INTO v_prev_sales
  FROM orders
  WHERE status = 'paid'
    AND paid_at >= p_prev_start
    AND paid_at < p_prev_end;

  -- Calculate growth percentage
  IF v_prev_sales > 0 THEN
    v_growth := ROUND(((v_current_sales - v_prev_sales) / v_prev_sales) * 100, 1);
  ELSE
    v_growth := 0;
  END IF;

  RETURN json_build_object(
    'total_sales',    v_current_sales,
    'order_count',    v_current_orders,
    'average_ticket', ROUND(v_current_avg, 2),
    'prev_sales',     v_prev_sales,
    'growth_pct',     v_growth
  );
END;
$$;

-- ============================================================================
-- DONE! Run 003_seed_data.sql next.
-- ============================================================================
