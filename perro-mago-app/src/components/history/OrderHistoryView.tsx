import { useOrders } from '../../hooks/useOrders';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Spinner } from '../ui/Spinner';
import { Badge } from '../ui/Badge';
import { History, Printer } from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';

export function OrderHistoryView() {
  const { data: orders, isLoading } = useOrders(100);
  const setLastCompletedOrder = useUIStore((s) => s.setLastCompletedOrder);
  const setShowTicket = useUIStore((s) => s.setShowTicket);

  const handleReprint = (order: typeof orders extends (infer T)[] | undefined ? T : never) => {
    setLastCompletedOrder(order as any);
    setShowTicket(true);
    setTimeout(() => window.print(), 300);
  };

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-3 bg-surface-container-low/50 sticky top-0 z-10 backdrop-blur-sm">
        <History size={20} className="text-primary" />
        <h1 className="text-lg font-bold text-on-surface">Historial de Órdenes</h1>
        <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
          {orders?.length || 0} órdenes
        </span>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size={32} />
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-on-surface-variant">
            <History size={48} strokeWidth={1} className="mb-3 opacity-30" />
            <p className="text-sm">No hay órdenes registradas</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-surface-container-high rounded-xl p-4 flex items-center gap-4 hover:bg-surface-container-highest transition-colors"
              >
                {/* Folio */}
                <div className="w-32 shrink-0">
                  <p className="text-xs text-on-surface-variant">Folio</p>
                  <p className="font-mono font-bold text-sm text-on-surface">{order.folio}</p>
                </div>

                {/* Date */}
                <div className="w-44 shrink-0">
                  <p className="text-xs text-on-surface-variant">Fecha</p>
                  <p className="text-sm text-on-surface">
                    {formatDate(order.paid_at || order.created_at)}
                  </p>
                </div>

                {/* Items count */}
                <div className="w-24 shrink-0">
                  <p className="text-xs text-on-surface-variant">Items</p>
                  <p className="text-sm text-on-surface">{order.items?.length || 0} productos</p>
                </div>

                {/* Total */}
                <div className="w-28 text-right shrink-0">
                  <p className="text-xs text-on-surface-variant">Total</p>
                  <p className="font-mono font-bold text-sm text-primary">
                    {formatCurrency(order.total)}
                  </p>
                </div>

                {/* Status */}
                <div className="flex-1 flex justify-center">
                  <Badge
                    variant={
                      order.status === 'paid'
                        ? 'success'
                        : order.status === 'cancelled'
                        ? 'danger'
                        : 'warning'
                    }
                  >
                    {order.status === 'paid'
                      ? 'Pagado'
                      : order.status === 'cancelled'
                      ? 'Cancelado'
                      : 'Pendiente'}
                  </Badge>
                </div>

                {/* Method */}
                <div className="w-20 text-center shrink-0">
                  <p className="text-xs text-on-surface-variant">Pago</p>
                  <p className="text-sm text-on-surface">
                    {order.payment_method === 'cash' ? '💵 Efectivo' : order.payment_method === 'card' ? '💳 Tarjeta' : '—'}
                  </p>
                </div>

                {/* Reprint */}
                {order.status === 'paid' && (
                  <button
                    onClick={() => handleReprint(order)}
                    className="p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-colors"
                    title="Reimprimir ticket"
                  >
                    <Printer size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
