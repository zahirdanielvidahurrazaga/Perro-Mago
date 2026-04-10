import { useLowStockItems } from '../../hooks/useInventory';
import { useUIStore } from '../../stores/useUIStore';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { AlertTriangle, PackagePlus } from 'lucide-react';
import { getUnitAbbr } from '../../lib/utils';
import { RestockModal } from '../inventory/RestockModal';

export function InventoryAlerts() {
  const { data: lowStockItems, isLoading } = useLowStockItems();
  const openRestockModal = useUIStore((s) => s.openRestockModal);

  return (
    <div className="bg-surface-container-high rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={18} className="text-warning" />
        <h3 className="font-bold text-on-surface">Stock Crítico</h3>
        {lowStockItems && lowStockItems.length > 0 && (
          <Badge variant="danger" pulse>
            {lowStockItems.length}
          </Badge>
        )}
      </div>

      <p className="text-xs text-on-surface-variant mb-4">Acción inmediata requerida</p>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <Spinner />
        </div>
      ) : !lowStockItems || lowStockItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-on-surface-variant">
          <div className="w-12 h-12 rounded-full bg-emerald-900/20 flex items-center justify-center mb-2">
            <PackagePlus size={20} className="text-success" />
          </div>
          <p className="text-sm font-medium text-success">Todo en orden</p>
          <p className="text-xs">No hay alertas de inventario</p>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto">
          {lowStockItems.map((item) => {
            const pct = item.reorder_threshold > 0
              ? Math.round((item.current_stock / item.reorder_threshold) * 100)
              : 0;
            const isCritical = item.current_stock <= item.reorder_threshold * 0.5;

            return (
              <div key={item.id} className="bg-surface-container-lowest rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-on-surface">{item.name}</h4>
                  <Badge variant={isCritical ? 'danger' : 'warning'} pulse={isCritical}>
                    {isCritical ? 'BAJO' : 'PRÓXIMO'}
                  </Badge>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-surface-container-high mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${isCritical ? 'bg-error' : 'bg-warning'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-on-surface-variant">
                  <span>
                    {item.current_stock.toLocaleString()}{getUnitAbbr(item.unit)} restantes
                  </span>
                  <span>
                    Límite: {item.reorder_threshold.toLocaleString()}{getUnitAbbr(item.unit)}
                  </span>
                </div>

                <button
                  onClick={() => openRestockModal(item.id)}
                  className="mt-2 w-full py-1.5 text-xs font-medium text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  Reabastecer
                </button>
              </div>
            );
          })}
        </div>
      )}

      {lowStockItems && lowStockItems.length > 0 && (
        <Button
          variant="secondary"
          size="md"
          fullWidth
          className="mt-4"
          icon={<PackagePlus size={16} />}
          onClick={() => {
            if (lowStockItems[0]) openRestockModal(lowStockItems[0].id);
          }}
        >
          Registrar Reabastecimiento
        </Button>
      )}

      <RestockModal />
    </div>
  );
}
