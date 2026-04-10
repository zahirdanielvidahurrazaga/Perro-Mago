import { create } from 'zustand';
import type { Order } from '../types/database';

interface UIStore {
  // Navigation
  activePage: 'pos' | 'dashboard' | 'inventory' | 'history';
  setActivePage: (page: 'pos' | 'dashboard' | 'inventory' | 'history') => void;
  
  // Modifier Modal
  isModifierModalOpen: boolean;
  modifierProductId: string | null;
  openModifierModal: (productId: string) => void;
  closeModifierModal: () => void;
  
  // Payment Modal
  isPaymentModalOpen: boolean;
  openPaymentModal: () => void;
  closePaymentModal: () => void;
  
  // Restock Modal
  isRestockModalOpen: boolean;
  restockItemId: string | null;
  openRestockModal: (itemId: string) => void;
  closeRestockModal: () => void;
  
  // Ticket / Last Order
  lastCompletedOrder: Order | null;
  setLastCompletedOrder: (order: Order | null) => void;
  showTicket: boolean;
  setShowTicket: (show: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activePage: 'pos',
  setActivePage: (page) => set({ activePage: page }),

  isModifierModalOpen: false,
  modifierProductId: null,
  openModifierModal: (productId) =>
    set({ isModifierModalOpen: true, modifierProductId: productId }),
  closeModifierModal: () =>
    set({ isModifierModalOpen: false, modifierProductId: null }),

  isPaymentModalOpen: false,
  openPaymentModal: () => set({ isPaymentModalOpen: true }),
  closePaymentModal: () => set({ isPaymentModalOpen: false }),

  isRestockModalOpen: false,
  restockItemId: null,
  openRestockModal: (itemId) =>
    set({ isRestockModalOpen: true, restockItemId: itemId }),
  closeRestockModal: () =>
    set({ isRestockModalOpen: false, restockItemId: null }),

  lastCompletedOrder: null,
  setLastCompletedOrder: (order) => set({ lastCompletedOrder: order }),
  showTicket: false,
  setShowTicket: (show) => set({ showTicket: show }),
}));
