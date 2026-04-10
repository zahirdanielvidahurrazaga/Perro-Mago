import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useUIStore } from '../../stores/useUIStore';
import { useCartStore } from '../../stores/useCartStore';
import { useProducts, useModifierGroups } from '../../hooks/useProducts';
import { formatCurrency, cn } from '../../lib/utils';
import type { SelectedModifier } from '../../types/pos';
import { Spinner } from '../ui/Spinner';

export function ModifierModal() {
  const isOpen = useUIStore((s) => s.isModifierModalOpen);
  const productId = useUIStore((s) => s.modifierProductId);
  const closeModal = useUIStore((s) => s.closeModifierModal);
  const addItem = useCartStore((s) => s.addItem);

  const { data: products } = useProducts();
  const { data: modifierGroups, isLoading } = useModifierGroups();

  const [selectedModifiers, setSelectedModifiers] = useState<SelectedModifier[]>([]);
  const [notes, setNotes] = useState('');

  const product = products?.find((p) => p.id === productId);

  const handleToggleMod = (modId: string, modName: string, priceDelta: number, groupName: string, selectionType: string) => {
    setSelectedModifiers((prev) => {
      const exists = prev.find((m) => m.modifierId === modId);
      if (exists) {
        return prev.filter((m) => m.modifierId !== modId);
      }
      if (selectionType === 'single') {
        // Remove other mods from same group and add this one
        return [
          ...prev.filter((m) => m.groupName !== groupName),
          { modifierId: modId, name: modName, priceDelta: priceDelta, groupName },
        ];
      }
      return [...prev, { modifierId: modId, name: modName, priceDelta: priceDelta, groupName }];
    });
  };

  const handleAdd = () => {
    if (!product) return;
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        categoryName: product.category?.name || '',
      },
      selectedModifiers,
      notes
    );
    setSelectedModifiers([]);
    setNotes('');
    closeModal();
  };

  const handleClose = () => {
    setSelectedModifiers([]);
    setNotes('');
    closeModal();
  };

  const modsDelta = selectedModifiers.reduce((s, m) => s + m.priceDelta, 0);
  const totalPrice = (product?.price || 0) + modsDelta;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={product?.name || 'Personalizar'} size="md">
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Product info */}
          <div className="flex items-center justify-between">
            <p className="text-on-surface-variant text-sm">{product?.description}</p>
            <span className="text-lg font-bold text-primary font-mono">
              {formatCurrency(product?.price || 0)}
            </span>
          </div>

          {/* Modifier Groups */}
          {modifierGroups?.map((group) => (
            <div key={group.id}>
              <h3 className="text-sm font-semibold text-on-surface mb-3">
                {group.name}
                <span className="text-on-surface-variant font-normal ml-2 text-xs">
                  {group.selection_type === 'single' ? '(Elige uno)' : '(Opcional)'}
                </span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.modifiers?.map((mod) => {
                  const isSelected = selectedModifiers.some(
                    (m) => m.modifierId === mod.id
                  );
                  return (
                    <button
                      key={mod.id}
                      onClick={() =>
                        handleToggleMod(
                          mod.id,
                          mod.name,
                          mod.price_delta,
                          group.name,
                          group.selection_type
                        )
                      }
                      className={cn(
                        'px-5 py-3 rounded-full text-sm font-medium transition-all duration-200 min-h-[48px] flex items-center justify-center',
                        isSelected
                          ? 'bg-primary text-on-primary'
                          : 'bg-secondary-container text-on-secondary-container hover:brightness-110'
                      )}
                    >
                      {mod.name}
                      {mod.price_delta > 0 && (
                        <span className="ml-1 opacity-80">
                          +{formatCurrency(mod.price_delta)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Notes */}
          <div>
            <h3 className="text-sm font-semibold text-on-surface mb-2">Notas especiales</h3>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: alérgico a gluten..."
              className="w-full px-4 py-2.5 bg-surface-container-lowest rounded-lg text-on-surface text-sm placeholder:text-on-surface-variant/40 outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4">
            <Button variant="ghost" onClick={handleClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="lg" onClick={handleAdd}>
              Agregar — {formatCurrency(totalPrice)}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
