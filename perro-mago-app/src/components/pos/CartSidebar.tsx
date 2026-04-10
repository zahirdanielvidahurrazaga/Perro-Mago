import { useCartStore } from '../../stores/useCartStore';
import { useUIStore } from '../../stores/useUIStore';
import { formatCurrency } from '../../lib/utils';
import { Button } from '../ui/Button';
import { ShoppingBag, Trash2, Minus, Plus, Banknote } from 'lucide-react';

export function CartSidebar() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getTax = useCartStore((s) => s.getTax);
  const getTotal = useCartStore((s) => s.getTotal);
  const clearCart = useCartStore((s) => s.clearCart);
  const openPaymentModal = useUIStore((s) => s.openPaymentModal);

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const hasItems = items.length > 0;

  return (
    <div className="w-80 bg-surface-container-low flex flex-col h-full shrink-0">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-primary" />
          <h2 className="font-bold text-base text-on-surface">Orden Actual</h2>
        </div>
        {hasItems && (
          <button
            onClick={clearCart}
            className="text-xs text-on-surface-variant hover:text-error transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto px-5 space-y-3">
        {!hasItems ? (
          <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant">
            <ShoppingBag size={40} strokeWidth={1} className="mb-3 opacity-30" />
            <p className="text-sm">Agrega productos</p>
            <p className="text-xs opacity-60">Toca un producto para agregarlo</p>
          </div>
        ) : (
          items.map((item) => {
            const modsDelta = item.modifiers.reduce((s, m) => s + m.priceDelta, 0);
            const unitPrice = item.basePrice + modsDelta;

            return (
              <div
                key={item.cartItemId}
                className="bg-surface-container-lowest rounded-xl p-3 animate-slide-up"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-on-surface truncate">
                      {item.productName}
                    </h4>
                    {item.modifiers.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {item.modifiers.map((mod) => (
                          <span
                            key={mod.modifierId}
                            className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container"
                          >
                            {mod.name}
                            {mod.priceDelta > 0 && ` +${formatCurrency(mod.priceDelta)}`}
                          </span>
                        ))}
                      </div>
                    )}
                    {item.notes && (
                      <p className="text-[10px] text-on-surface-variant mt-1 italic">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-sm font-bold text-primary font-mono shrink-0">
                    {formatCurrency(unitPrice * item.quantity)}
                  </span>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center justify-between mt-2.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold font-mono text-on-surface">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.cartItemId)}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary */}
      <div className="px-5 py-4 bg-surface-container space-y-4">
        {/* Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Subtotal</span>
            <span className="font-mono text-on-surface">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">IVA (16%)</span>
            <span className="font-mono text-on-surface">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-2">
            <span className="text-on-surface">TOTAL</span>
            <span className="font-mono text-primary">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Payment Buttons */}
        <div className="space-y-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!hasItems}
            onClick={openPaymentModal}
            icon={<Banknote size={20} />}
          >
            Cobrar
          </Button>
        </div>
      </div>
    </div>
  );
}
