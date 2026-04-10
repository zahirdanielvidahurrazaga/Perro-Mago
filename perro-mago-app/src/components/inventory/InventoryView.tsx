import { useState } from 'react';
import { useInventory } from '../../hooks/useInventory';
import { useUIStore } from '../../stores/useUIStore';
import { getUnitAbbr, cn } from '../../lib/utils';
import { Spinner } from '../ui/Spinner';
import { RestockModal } from './RestockModal';
import { Package, Search, PackagePlus } from 'lucide-react';

export function InventoryView() {
  const { data: items, isLoading } = useInventory();
  const openRestockModal = useUIStore((s) => s.openRestockModal);
  const [search, setSearch] = useState('');

  const filtered = items?.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between bg-surface-container-low/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Package size={20} className="text-primary" />
          <h1 className="text-lg font-bold text-on-surface">Inventario</h1>
          <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
            {items?.length || 0} insumos
          </span>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar insumo..."
            className="pl-9 pr-4 py-2 text-sm bg-surface-container-lowest rounded-lg text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-1 focus:ring-primary w-56"
          />
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Spinner size={32} />
          </div>
        ) : (
          <div className="bg-surface-container-high rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-medium text-on-surface-variant uppercase tracking-wider bg-surface-container-highest">
              <span className="col-span-4">Insumo</span>
              <span className="col-span-2 text-center">Unidad</span>
              <span className="col-span-2 text-right">Stock Actual</span>
              <span className="col-span-2 text-right">Umbral</span>
              <span className="col-span-2 text-center">Acción</span>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-outline-variant/10">
              {filtered?.map((item) => {
                const isLow = item.current_stock <= item.reorder_threshold;
                const isCritical = item.current_stock <= item.reorder_threshold * 0.5;

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-surface-container-highest/50 transition-colors"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <div className={cn(
                        'w-2 h-2 rounded-full shrink-0',
                        isCritical ? 'bg-error animate-pulse-alert' : isLow ? 'bg-warning' : 'bg-success'
                      )} />
                      <span className="text-sm font-medium text-on-surface">{item.name}</span>
                    </div>
                    <span className="col-span-2 text-center text-sm text-on-surface-variant">
                      {getUnitAbbr(item.unit)}
                    </span>
                    <span className={cn(
                      'col-span-2 text-right text-sm font-mono font-semibold',
                      isCritical ? 'text-error' : isLow ? 'text-warning' : 'text-on-surface'
                    )}>
                      {item.current_stock.toLocaleString()}
                    </span>
                    <span className="col-span-2 text-right text-sm font-mono text-on-surface-variant">
                      {item.reorder_threshold.toLocaleString()}
                    </span>
                    <div className="col-span-2 flex justify-center">
                      <button
                        onClick={() => openRestockModal(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                      >
                        <PackagePlus size={13} />
                        Reabastecer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <RestockModal />
    </div>
  );
}
