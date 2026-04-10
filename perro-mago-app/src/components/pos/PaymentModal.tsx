import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useUIStore } from '../../stores/useUIStore';
import { useCartStore } from '../../stores/useCartStore';
import { useCreateOrder, useProcessPayment } from '../../hooks/useOrders';
import { formatCurrency, cn } from '../../lib/utils';
import { Banknote, CreditCard, CheckCircle2 } from 'lucide-react';
import { Spinner } from '../ui/Spinner';
import type { PaymentMethod } from '../../types/database';

const quickCashAmounts = [50, 100, 200, 500, 1000];

export function PaymentModal() {
  const isOpen = useUIStore((s) => s.isPaymentModalOpen);
  const closeModal = useUIStore((s) => s.closePaymentModal);
  const items = useCartStore((s) => s.items);
  const getTotal = useCartStore((s) => s.getTotal);

  const createOrder = useCreateOrder();
  const processPayment = useProcessPayment();

  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState('');
  const [step, setStep] = useState<'method' | 'processing' | 'success'>('method');

  const total = getTotal();
  const change = method === 'cash' ? parseFloat(cashReceived || '0') - total : 0;
  const canPay =
    method === 'card' || (method === 'cash' && parseFloat(cashReceived || '0') >= total);

  const handlePay = async () => {
    if (!canPay) return;
    setStep('processing');

    try {
      // 1. Create order in DB
      const order = await createOrder.mutateAsync(items);

      // 2. Process payment atomically via RPC
      await processPayment.mutateAsync({
        orderId: order.id,
        method,
        cashReceived: method === 'cash' ? parseFloat(cashReceived) : undefined,
      });

      setStep('success');
      
      // Auto-close after showing success
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (err) {
      console.error('Payment error:', err);
      setStep('method');
    }
  };

  const handleClose = () => {
    setStep('method');
    setMethod('cash');
    setCashReceived('');
    closeModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Cobrar" size="md">
      {step === 'success' ? (
        <div className="flex flex-col items-center py-8 animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-emerald-900/30 flex items-center justify-center mb-4">
            <CheckCircle2 size={40} className="text-success" />
          </div>
          <h3 className="text-xl font-bold text-on-surface">¡Pago Exitoso!</h3>
          <p className="text-on-surface-variant text-sm mt-1">Imprimiendo ticket...</p>
          {method === 'cash' && change > 0 && (
            <div className="mt-4 bg-surface-container-high rounded-xl px-6 py-3">
              <p className="text-sm text-on-surface-variant">Cambio</p>
              <p className="text-2xl font-bold text-primary font-mono">{formatCurrency(change)}</p>
            </div>
          )}
        </div>
      ) : step === 'processing' ? (
        <div className="flex flex-col items-center py-12">
          <Spinner size={40} />
          <p className="text-on-surface-variant mt-4">Procesando pago...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Method Selection */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMethod('cash')}
              className={cn(
                'flex flex-col items-center gap-2 p-5 rounded-xl transition-all duration-200 min-h-[100px]',
                method === 'cash'
                  ? 'bg-primary/10 ghost-border-active'
                  : 'bg-surface-container-high hover:bg-surface-container-highest'
              )}
            >
              <Banknote
                size={28}
                className={method === 'cash' ? 'text-primary' : 'text-on-surface-variant'}
              />
              <span
                className={cn(
                  'font-semibold text-sm',
                  method === 'cash' ? 'text-primary' : 'text-on-surface-variant'
                )}
              >
                Efectivo
              </span>
            </button>
            <button
              onClick={() => setMethod('card')}
              className={cn(
                'flex flex-col items-center gap-2 p-5 rounded-xl transition-all duration-200 min-h-[100px]',
                method === 'card'
                  ? 'bg-primary/10 ghost-border-active'
                  : 'bg-surface-container-high hover:bg-surface-container-highest'
              )}
            >
              <CreditCard
                size={28}
                className={method === 'card' ? 'text-primary' : 'text-on-surface-variant'}
              />
              <span
                className={cn(
                  'font-semibold text-sm',
                  method === 'card' ? 'text-primary' : 'text-on-surface-variant'
                )}
              >
                Tarjeta
              </span>
            </button>
          </div>

          {/* Cash Calculator */}
          {method === 'cash' && (
            <div className="space-y-3 animate-slide-up">
              <label className="text-sm font-semibold text-on-surface">
                Efectivo recibido
              </label>
              <input
                type="number"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                placeholder="$ 0.00"
                className="w-full px-4 py-3 bg-surface-container-lowest rounded-xl text-on-surface text-2xl font-bold font-mono text-center outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              
              {/* Quick amounts */}
              <div className="flex gap-2">
                {quickCashAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setCashReceived(amount.toString())}
                    className="flex-1 py-2.5 rounded-lg bg-surface-container-high text-on-surface-variant text-sm font-medium hover:bg-surface-container-highest hover:text-on-surface transition-colors font-mono"
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              {/* Change display */}
              {parseFloat(cashReceived || '0') > 0 && (
                <div className={cn(
                  'flex justify-between items-center p-4 rounded-xl',
                  change >= 0 ? 'bg-emerald-900/20' : 'bg-red-900/20'
                )}>
                  <span className="text-sm font-medium text-on-surface-variant">Cambio</span>
                  <span className={cn(
                    'text-xl font-bold font-mono',
                    change >= 0 ? 'text-success' : 'text-error'
                  )}>
                    {formatCurrency(Math.max(0, change))}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center p-4 bg-surface-container-highest rounded-xl">
            <span className="font-semibold text-on-surface">Total a cobrar</span>
            <span className="text-2xl font-bold text-primary font-mono">
              {formatCurrency(total)}
            </span>
          </div>

          {/* Pay Button */}
          <Button
            variant="primary"
            size="xl"
            fullWidth
            disabled={!canPay}
            onClick={handlePay}
            icon={method === 'cash' ? <Banknote size={22} /> : <CreditCard size={22} />}
          >
            {method === 'cash' ? 'Cobrar en Efectivo' : 'Cobrar con Tarjeta'}
          </Button>
        </div>
      )}
    </Modal>
  );
}
