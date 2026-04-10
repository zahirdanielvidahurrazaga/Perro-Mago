import { useUIStore } from '../../stores/useUIStore';
import { formatCurrency, formatDate } from '../../lib/utils';
import { RESTAURANT_NAME, RESTAURANT_TAGLINE, TICKET_FOOTER } from '../../lib/constants';
import type { Order, OrderItem, OrderItemModifier, ProductModifier } from '../../types/database';

export function PrintTicket() {
  const lastOrder = useUIStore((s) => s.lastCompletedOrder) as (Order & { items: (OrderItem & { product: { name: string }; modifiers: (OrderItemModifier & { modifier: ProductModifier })[] })[] }) | null;
  const showTicket = useUIStore((s) => s.showTicket);

  if (!lastOrder || !showTicket) return null;

  return (
    <div id="print-ticket" className="hidden print:block">
      <div style={{ width: '80mm', padding: '4mm', fontFamily: 'monospace', fontSize: '12px', lineHeight: '1.5' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <svg width="50" height="50" viewBox="0 0 50 50" style={{ margin: '0 auto 4px' }}>
            <circle cx="25" cy="25" r="22" fill="none" stroke="#000" strokeWidth="2" />
            <text x="25" y="20" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#000">PERRO</text>
            <text x="25" y="32" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#000">MAGO</text>
            <text x="25" y="42" textAnchor="middle" fontSize="5" fill="#000">✨🐾</text>
          </svg>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{RESTAURANT_NAME}</div>
          <div style={{ fontSize: '10px' }}>{RESTAURANT_TAGLINE}</div>
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
          <span>Folio: {lastOrder.folio}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', marginTop: '2px' }}>
          <span>{lastOrder.paid_at ? formatDate(lastOrder.paid_at) : formatDate(lastOrder.created_at)}</span>
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

        <table style={{ width: '100%', fontSize: '11px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', paddingBottom: '4px', fontSize: '10px' }}>Cant</th>
              <th style={{ textAlign: 'left', paddingBottom: '4px', fontSize: '10px' }}>Producto</th>
              <th style={{ textAlign: 'right', paddingBottom: '4px', fontSize: '10px' }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            {lastOrder.items?.map((item) => {
              const lineTotal = item.unit_price * item.quantity;
              return (
                <tr key={item.id}>
                  <td style={{ verticalAlign: 'top', paddingTop: '3px' }}>{item.quantity}</td>
                  <td style={{ paddingTop: '3px' }}>
                    <div>{item.product?.name || 'Producto'}</div>
                    {item.modifiers?.map((m) => (
                      <div key={m.id} style={{ fontSize: '9px', paddingLeft: '8px', color: '#555' }}>
                        → {m.modifier?.name}
                        {Number(m.price_delta) > 0 && ` +${formatCurrency(Number(m.price_delta))}`}
                      </div>
                    ))}
                    {item.notes && (
                      <div style={{ fontSize: '9px', paddingLeft: '8px', fontStyle: 'italic', color: '#666' }}>
                        Nota: {item.notes}
                      </div>
                    )}
                  </td>
                  <td style={{ textAlign: 'right', verticalAlign: 'top', paddingTop: '3px' }}>
                    {formatCurrency(lineTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />

        <div style={{ fontSize: '11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Subtotal:</span>
            <span>{formatCurrency(lastOrder.subtotal)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>IVA (16%):</span>
            <span>{formatCurrency(lastOrder.tax_amount)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px', marginTop: '4px' }}>
            <span>TOTAL:</span>
            <span>{formatCurrency(lastOrder.total)}</span>
          </div>
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
        <div style={{ fontSize: '11px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Método:</span>
            <span>{lastOrder.payment_method === 'cash' ? 'Efectivo' : 'Tarjeta'}</span>
          </div>
          {lastOrder.payment_method === 'cash' && lastOrder.cash_received && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Recibido:</span>
                <span>{formatCurrency(lastOrder.cash_received)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                <span>Cambio:</span>
                <span>{formatCurrency(lastOrder.change_amount || 0)}</span>
              </div>
            </>
          )}
        </div>

        <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }} />
        <div style={{ textAlign: 'center', fontSize: '10px', whiteSpace: 'pre-line' }}>
          {TICKET_FOOTER}
        </div>
      </div>
    </div>
  );
}
