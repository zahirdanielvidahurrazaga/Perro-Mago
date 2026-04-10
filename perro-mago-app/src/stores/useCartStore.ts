import { create } from 'zustand';
import type { CartItem, SelectedModifier } from '../types/pos';
import { getCartItemUnitPrice } from '../types/pos';
import { TAX_RATE } from '../lib/constants';
import { generateId } from '../lib/utils';

interface CartStore {
  items: CartItem[];
  addItem: (product: { id: string; name: string; price: number; categoryName: string }, modifiers?: SelectedModifier[], notes?: string) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product, modifiers = [], notes = '') => {
    set((state) => {
      const existingIdx = state.items.findIndex(
        (item) =>
          item.productId === product.id &&
          item.notes === notes &&
          JSON.stringify(item.modifiers.map((m) => m.modifierId).sort()) ===
            JSON.stringify(modifiers.map((m) => m.modifierId).sort())
      );

      if (existingIdx >= 0) {
        const newItems = [...state.items];
        newItems[existingIdx] = {
          ...newItems[existingIdx],
          quantity: newItems[existingIdx].quantity + 1,
        };
        return { items: newItems };
      }

      return {
        items: [
          ...state.items,
          {
            cartItemId: generateId(),
            productId: product.id,
            productName: product.name,
            categoryName: product.categoryName,
            basePrice: product.price,
            quantity: 1,
            modifiers,
            notes,
          },
        ],
      };
    });
  },

  removeItem: (cartItemId) => {
    set((state) => ({
      items: state.items.filter((item) => item.cartItemId !== cartItemId),
    }));
  },

  updateQuantity: (cartItemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(cartItemId);
      return;
    }
    set((state) => ({
      items: state.items.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + getCartItemUnitPrice(item) * item.quantity,
      0
    );
  },

  getTax: () => {
    const subtotal = get().getSubtotal();
    return Math.round(subtotal * TAX_RATE * 100) / 100;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
    return subtotal + tax;
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
