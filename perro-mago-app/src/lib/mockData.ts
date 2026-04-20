import type { 
  Category, 
  Product, 
  InventoryItem, 
  Order, 
  OrderItem, 
  PaymentMethod,
  DashboardKPIs
} from '../types/database';
import type { CartItem } from '../types/pos';
import { getCartItemUnitPrice } from '../types/pos';
import { TAX_RATE } from './constants';

// --- Claves de LocalStorage ---
const KEYS = {
  ORDERS: 'pm_demo_orders',
  INVENTORY: 'pm_demo_inventory',
  CATEGORIES: 'pm_demo_categories',
  PRODUCTS: 'pm_demo_products',
  MODIFIER_GROUPS: 'pm_demo_modifier_groups'
};

// --- Datos Iniciales ---
const INITIAL_CATEGORIES: Category[] = [
  { id: '1', name: 'Hamburguesas', slug: 'hamburguesas', icon: 'beef', display_order: 1, created_at: new Date().toISOString() },
  { id: '2', name: 'Complementos', slug: 'complementos', icon: 'fries', display_order: 2, created_at: new Date().toISOString() },
  { id: '3', name: 'Bebidas', slug: 'bebidas', icon: 'cup-soda', display_order: 3, created_at: new Date().toISOString() },
];

const INITIAL_PRODUCTS: (Product & { category: Category })[] = [
  { id: 'p1', name: 'Burger BBQ', category_id: '1', price: 199, description: 'Hamburguesa con salsa BBQ', is_available: true, has_modifiers: true, created_at: new Date().toISOString(), category: INITIAL_CATEGORIES[0], image_url: null },
  { id: 'p2', name: 'Burger Clásica', category_id: '1', price: 149, description: 'La receta original', is_available: true, has_modifiers: true, created_at: new Date().toISOString(), category: INITIAL_CATEGORIES[0], image_url: null },
  { id: 'p3', name: 'Burger Especial', category_id: '1', price: 179, description: 'Con ingredientes premium', is_available: true, has_modifiers: true, created_at: new Date().toISOString(), category: INITIAL_CATEGORIES[0], image_url: null },
  { id: 'p4', name: 'Papas Fritas', category_id: '2', price: 65, description: 'Crujientes y sazonadas', is_available: true, has_modifiers: false, created_at: new Date().toISOString(), category: INITIAL_CATEGORIES[1], image_url: null },
  { id: 'p5', name: 'Aros de Cebolla', category_id: '2', price: 79, description: 'Con aderezo ranch', is_available: true, has_modifiers: false, created_at: new Date().toISOString(), category: INITIAL_CATEGORIES[1], image_url: null },
  { id: 'p6', name: 'Agua Horchata', category_id: '3', price: 45, description: 'Aguas frescas naturales', is_available: true, has_modifiers: false, created_at: new Date().toISOString(), category: INITIAL_CATEGORIES[2], image_url: null },
  { id: 'p7', name: 'Agua Jamaica', category_id: '3', price: 45, description: 'Aguas frescas naturales', is_available: true, has_modifiers: false, created_at: new Date().toISOString(), category: INITIAL_CATEGORIES[2], image_url: null },
  { id: 'p8', name: 'Coca-Cola', category_id: '3', price: 35, description: '600ml original', is_available: true, has_modifiers: false, created_at: new Date().toISOString(), category: INITIAL_CATEGORIES[2], image_url: null },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Carne (kg)', unit: 'g', current_stock: 5000, reorder_threshold: 1000, cost_per_unit: 0.15, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'i2', name: 'Pan Brioche', unit: 'unit', current_stock: 48, reorder_threshold: 12, cost_per_unit: 8, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'i3', name: 'Queso Americano', unit: 'unit', current_stock: 100, reorder_threshold: 20, cost_per_unit: 3, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'i4', name: 'Papas (Congeladas)', unit: 'g', current_stock: 10000, reorder_threshold: 2000, cost_per_unit: 0.05, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

// --- Helpers de Almacenamiento ---
function getStored<T>(key: string, initial: T): T {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : initial;
}

function setStored<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Servicio Mock ---
export const mockDataService = {
  // Productos & Categorías
  getCategories: () => Promise.resolve(INITIAL_CATEGORIES),
  getProducts: () => Promise.resolve(INITIAL_PRODUCTS),
  getModifierGroups: () => Promise.resolve([]),

  // Inventario
  getInventory: () => Promise.resolve(getStored(KEYS.INVENTORY, INITIAL_INVENTORY)),
  
  restockInventory: (itemId: string, quantity: number, _notes?: string) => {
    const inventory = getStored(KEYS.INVENTORY, INITIAL_INVENTORY);
    const item = inventory.find(i => i.id === itemId);
    if (item) {
      item.current_stock += quantity;
      item.updated_at = new Date().toISOString();
      setStored(KEYS.INVENTORY, inventory);
      return Promise.resolve({ success: true, item_name: item.name, new_stock: item.current_stock });
    }
    return Promise.reject(new Error('Item no encontrado'));
  },

  // Órdenes
  getOrders: (limit: number) => {
    const orders = getStored<Order[]>(KEYS.ORDERS, []);
    return Promise.resolve(orders.slice(0, limit));
  },

  createOrder: (cartItems: CartItem[]) => {
    const orders = getStored<Order[]>(KEYS.ORDERS, []);
    const subtotal = cartItems.reduce((sum, item) => sum + getCartItemUnitPrice(item) * item.quantity, 0);
    const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100;
    const total = subtotal + taxAmount;

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      folio: `DEMO-${String(orders.length + 1).padStart(4, '0')}`,
      status: 'pending',
      payment_method: null,
      subtotal,
      tax_amount: taxAmount,
      total,
      cash_received: null,
      change_amount: null,
      created_at: new Date().toISOString(),
      paid_at: null,
      items: cartItems.map(ci => ({
        id: Math.random().toString(36).substr(2, 9),
        order_id: '',
        product_id: ci.productId,
        quantity: ci.quantity,
        unit_price: getCartItemUnitPrice(ci),
        notes: ci.notes || null,
        product: INITIAL_PRODUCTS.find(p => p.id === ci.productId)
      })) as OrderItem[]
    };

    orders.unshift(newOrder); // Nueva al principio
    setStored(KEYS.ORDERS, orders);
    return Promise.resolve(newOrder);
  },

  processPayment: (orderId: string, method: PaymentMethod, cashReceived?: number) => {
    const orders = getStored<Order[]>(KEYS.ORDERS, []);
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) return Promise.reject(new Error('Orden no encontrada'));

    const order = orders[orderIndex];
    order.status = 'paid';
    order.payment_method = method;
    order.paid_at = new Date().toISOString();
    order.cash_received = cashReceived || order.total;
    order.change_amount = cashReceived ? cashReceived - order.total : 0;

    // Actualizar stock de inventario (simplificado para demo)
    const inventory = getStored(KEYS.INVENTORY, INITIAL_INVENTORY);
    order.items?.forEach(item => {
      // Simular descuento de stock según el producto
      if (item.product?.category_id === '1') { // Hamburguesa
        const carne = inventory.find(i => i.id === 'i1');
        const pan = inventory.find(i => i.id === 'i2');
        if (carne) carne.current_stock -= 150 * item.quantity;
        if (pan) pan.current_stock -= item.quantity;
      }
      if (item.product_id === 'p4' || item.product_id === 'p5') { // Papas o Aros
        const papa = inventory.find(i => i.id === 'i4');
        if (papa) papa.current_stock -= 200 * item.quantity;
      }
    });

    setStored(KEYS.ORDERS, orders);
    setStored(KEYS.INVENTORY, inventory);

    return Promise.resolve({
      success: true,
      order_id: order.id,
      folio: order.folio,
      total: order.total,
      method: order.payment_method,
      change: order.change_amount
    });
  },

  // Dashboard
  getDashboardKPIs: () => {
    const orders = getStored<Order[]>(KEYS.ORDERS, []).filter(o => o.status === 'paid');
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const kpis: DashboardKPIs = {
      total_sales: totalSales,
      order_count: orders.length,
      average_ticket: orders.length > 0 ? totalSales / orders.length : 0,
      prev_sales: totalSales * 0.8, // Simulación de crecimiento
      growth_pct: 20
    };
    return Promise.resolve(kpis);
  },

  getSalesByHour: () => {
    const hours = Array.from({ length: 13 }, (_, i) => ({ hour: 10 + i, total_sales: 0, order_count: 0 }));
    const orders = getStored<Order[]>(KEYS.ORDERS, []).filter(o => o.status === 'paid');
    
    orders.forEach(o => {
      const h = new Date(o.paid_at!).getHours();
      const hourRow = hours.find(hr => hr.hour === h);
      if (hourRow) {
        hourRow.total_sales += o.total;
        hourRow.order_count += 1;
      }
    });

    return Promise.resolve(hours);
  },

  getSalesByCategory: () => {
    const sales = INITIAL_CATEGORIES.map(c => ({ category_name: c.name, total_sales: 0, item_count: 0 }));
    const orders = getStored<Order[]>(KEYS.ORDERS, []).filter(o => o.status === 'paid');
    
    orders.forEach(o => {
      o.items?.forEach(item => {
        const cat = sales.find(s => s.category_name === item.product?.category?.name);
        if (cat) {
          cat.total_sales += item.unit_price * item.quantity;
          cat.item_count += item.quantity;
        }
      });
    });

    return Promise.resolve(sales);
  },

  getTopProducts: () => {
    const top = INITIAL_PRODUCTS.map(p => ({ product_name: p.name, category_name: p.category?.name || '', units_sold: 0, total_revenue: 0 }));
    const orders = getStored<Order[]>(KEYS.ORDERS, []).filter(o => o.status === 'paid');

    orders.forEach(o => {
      o.items?.forEach(item => {
        const p = top.find(tp => tp.product_name === item.product?.name);
        if (p) {
          p.units_sold += item.quantity;
          p.total_revenue += item.unit_price * item.quantity;
        }
      });
    });

    return Promise.resolve(top.sort((a, b) => b.total_revenue - a.total_revenue).slice(0, 5));
  }
};
