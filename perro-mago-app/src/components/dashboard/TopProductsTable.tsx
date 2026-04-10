import { useTopProducts } from '../../hooks/useDashboard';
import { formatCurrency } from '../../lib/utils';
import { Spinner } from '../ui/Spinner';
import { Trophy } from 'lucide-react';

const rankColors = ['text-primary', 'text-on-surface', 'text-on-surface-variant'];

export function TopProductsTable() {
  const { data, isLoading } = useTopProducts();

  return (
    <div className="bg-surface-container-high rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-on-surface">Top 5 Productos Más Vendidos</h3>
        <Trophy size={18} className="text-primary" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Spinner />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-on-surface-variant text-sm">
          Sin datos de ventas aún
        </div>
      ) : (
        <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0 hide-scrollbar pb-2">
          <div className="space-y-1 min-w-[500px]">
            {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-medium text-on-surface-variant uppercase tracking-wider">
            <span className="col-span-1">#</span>
            <span className="col-span-5">Producto</span>
            <span className="col-span-3 text-right">Unidades</span>
            <span className="col-span-3 text-right">Ingresos</span>
          </div>

          {data.map((product, index) => (
            <div
              key={product.product_name}
              className="grid grid-cols-12 gap-2 px-3 py-3 rounded-lg hover:bg-surface-container-highest transition-colors items-center"
            >
              <span className={`col-span-1 text-sm font-bold font-mono ${rankColors[index] || 'text-on-surface-variant'}`}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className="col-span-5">
                <p className="text-sm font-semibold text-on-surface">{product.product_name}</p>
                <p className="text-[10px] text-on-surface-variant">{product.category_name}</p>
              </div>
              <span className="col-span-3 text-right text-sm font-mono text-on-surface">
                {product.units_sold}
              </span>
              <span className="col-span-3 text-right text-sm font-bold font-mono text-primary">
                {formatCurrency(product.total_revenue)}
              </span>
            </div>
          ))}
        </div>
        </div>
      )}
    </div>
  );
}
