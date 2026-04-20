import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, IS_DEMO_MODE } from '../lib/supabase';
import { mockDataService } from '../lib/mockData';
import type { Order, OrderItem, PaymentMethod } from '../types/database';
import type { CartItem } from '../types/pos';
import { getCartItemUnitPrice } from '../types/pos';
import { useCartStore } from '../stores/useCartStore';
import { useUIStore } from '../stores/useUIStore';
import { TAX_RATE } from '../lib/constants';

/** Fetch recent orders */
export function useOrders(limit = 50) {
  return useQuery({
    queryKey: ['orders', limit],
    queryFn: async () => {
      if (IS_DEMO_MODE) return mockDataService.getOrders(limit);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*),
            modifiers:order_item_modifiers(
              *,
              modifier:product_modifiers(*)
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as unknown as (Order & { items: OrderItem[] })[];
    },
    staleTime: 30 * 1000,
  });
}

/** Create order from cart items */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cartItems: CartItem[]) => {
      if (IS_DEMO_MODE) return mockDataService.createOrder(cartItems);

      const subtotal = cartItems.reduce(
        (sum, item) => sum + getCartItemUnitPrice(item) * item.quantity,
        0
      );
      const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100;
      const total = subtotal + taxAmount;

      // 1. Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          status: 'pending',
          payment_method: null,
          subtotal,
          tax_amount: taxAmount,
          total,
          cash_received: null,
          change_amount: null,
          paid_at: null,
        } as Record<string, unknown>)
        .select()
        .single();

      if (orderError) throw orderError;
      const orderData = order as Record<string, unknown>;

      // 2. Create order items
      for (const cartItem of cartItems) {
        const unitPrice = getCartItemUnitPrice(cartItem);
        
        const { data: orderItem, error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: orderData.id,
            product_id: cartItem.productId,
            quantity: cartItem.quantity,
            unit_price: unitPrice,
            notes: cartItem.notes || null,
          } as Record<string, unknown>)
          .select()
          .single();

        if (itemError) throw itemError;
        const orderItemData = orderItem as Record<string, unknown>;

        // 3. Create order item modifiers
        if (cartItem.modifiers.length > 0) {
          const { error: modError } = await supabase
            .from('order_item_modifiers')
            .insert(
              cartItem.modifiers.map((mod) => ({
                order_item_id: orderItemData.id,
                modifier_id: mod.modifierId,
                price_delta: mod.priceDelta,
              })) as Record<string, unknown>[]
            );

          if (modError) throw modError;
        }
      }

      return orderData as unknown as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

/** Process payment */
export function useProcessPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      method,
      cashReceived,
    }: {
      orderId: string;
      method: PaymentMethod;
      cashReceived?: number;
    }) => {
      if (IS_DEMO_MODE) return mockDataService.processPayment(orderId, method, cashReceived);

      const { data, error } = await supabase.rpc('process_order_payment', {
        p_order_id: orderId,
        p_payment_method: method,
        p_cash_received: cashReceived ?? null,
      } as Record<string, unknown>);

      if (error) throw error;
      
      const result = data as unknown as { success: boolean; error?: string; folio?: string; change?: number; order_id?: string; total?: number; method?: string };
      if (!result.success) {
        throw new Error(result.error || 'Payment failed');
      }
      
      return result;
    },
    onMutate: async ({ orderId }) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] });
      const previousOrders = queryClient.getQueryData(['orders', 50]);
      
      queryClient.setQueryData(['orders', 50], (old: unknown) => {
        const orders = old as Order[] | undefined;
        return orders?.map((o) =>
          o.id === orderId
            ? { ...o, status: 'paid' as const, paid_at: new Date().toISOString() }
            : o
        );
      });
      
      return { previousOrders };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders', 50], context.previousOrders);
      }
    },
    onSuccess: async (_result, { orderId }) => {
      const clearCart = useCartStore.getState().clearCart;
      const closePaymentModal = useUIStore.getState().closePaymentModal;
      const setLastCompletedOrder = useUIStore.getState().setLastCompletedOrder;
      const setShowTicket = useUIStore.getState().setShowTicket;

      clearCart();
      closePaymentModal();
      
      // Fetch the complete order for the ticket
      if (IS_DEMO_MODE) {
        const orders = await mockDataService.getOrders(50);
        const order = orders.find(o => o.id === orderId);
        if (order) {
            setLastCompletedOrder(order);
            setShowTicket(true);
            setTimeout(() => window.print(), 500);
        }
        return;
      }

      const { data: completedOrder } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(
            *,
            product:products(*),
            modifiers:order_item_modifiers(
              *,
              modifier:product_modifiers(*)
            )
          )
        `)
        .eq('id', orderId)
        .single();
      
      if (completedOrder) {
        setLastCompletedOrder(completedOrder as unknown as Order);
        setShowTicket(true);
        setTimeout(() => window.print(), 500);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}

