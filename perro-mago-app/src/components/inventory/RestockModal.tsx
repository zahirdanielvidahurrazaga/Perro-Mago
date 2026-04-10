import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useUIStore } from '../../stores/useUIStore';
import { useInventory } from '../../hooks/useInventory';
import { useRestock } from '../../hooks/useRestock';
import { getUnitAbbr } from '../../lib/utils';
import { Spinner } from '../ui/Spinner';
import { PackagePlus } from 'lucide-react';

export function RestockModal() {
  const isOpen = useUIStore((s) => s.isRestockModalOpen);
  const itemId = useUIStore((s) => s.restockItemId);
  const closeModal = useUIStore((s) => s.closeRestockModal);
  const { data: inventory } = useInventory();
  const restock = useRestock();

  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');

  const item = inventory?.find((i) => i.id === itemId);

  const handleSubmit = () => {
    if (!itemId || !quantity || parseFloat(quantity) <= 0) return;
    restock.mutate(
      {
        inventoryItemId: itemId,
        quantityAdded: parseFloat(quantity),
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          setQuantity('');
          setNotes('');
        },
      }
    );
  };

  const handleClose = () => {
    setQuantity('');
    setNotes('');
    closeModal();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Registrar Reabastecimiento" size="sm">
      {item ? (
        <div className="space-y-5">
          {/* Item info */}
          <div className="bg-surface-container-lowest rounded-xl p-4">
            <p className="text-sm font-semibold text-on-surface">{item.name}</p>
            <p className="text-xs text-on-surface-variant mt-1">
              Stock actual: <span className="font-mono font-bold text-on-surface">{item.current_stock.toLocaleString()}</span> {getUnitAbbr(item.unit)}
            </p>
            <p className="text-xs text-on-surface-variant">
              Umbral: <span className="font-mono">{item.reorder_threshold.toLocaleString()}</span> {getUnitAbbr(item.unit)}
            </p>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-sm font-medium text-on-surface mb-2 block">
              Cantidad a agregar ({getUnitAbbr(item.unit)})
            </label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={`Ej: 1000 ${getUnitAbbr(item.unit)}`}
              className="w-full px-4 py-3 bg-surface-container-lowest rounded-lg text-on-surface text-lg font-mono outline-none focus:ring-1 focus:ring-primary"
              autoFocus
            />
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-on-surface mb-2 block">
              Notas (opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Proveedor X, Factura #123"
              className="w-full px-4 py-2.5 bg-surface-container-lowest rounded-lg text-on-surface text-sm outline-none focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/40"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={handleClose} className="flex-1">
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!quantity || parseFloat(quantity) <= 0 || restock.isPending}
              icon={restock.isPending ? <Spinner size={16} /> : <PackagePlus size={16} />}
              className="flex-1"
            >
              {restock.isPending ? 'Guardando...' : 'Reabastecer'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      )}
    </Modal>
  );
}
