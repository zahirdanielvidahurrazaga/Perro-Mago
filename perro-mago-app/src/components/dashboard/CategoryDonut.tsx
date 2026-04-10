import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useSalesByCategory } from '../../hooks/useDashboard';
import { formatCurrency } from '../../lib/utils';
import { CATEGORY_COLORS } from '../../lib/constants';
import { Spinner } from '../ui/Spinner';

const DEFAULT_COLORS = ['#F6BE39', '#A9C7FF', '#10B981', '#E1C387'];

export function CategoryDonut() {
  const { data, isLoading } = useSalesByCategory();

  const total = data?.reduce((s, d) => s + Number(d.total_sales), 0) || 0;

  return (
    <div className="bg-surface-container-high rounded-xl p-5 h-full">
      <div className="mb-4">
        <h3 className="font-bold text-on-surface">Distribución</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">Por categoría de producto</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Spinner />
        </div>
      ) : !data || data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-on-surface-variant text-sm">
          Sin datos aún
        </div>
      ) : (
        <>
          <div className="relative">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="total_sales"
                  nameKey="category_name"
                  strokeWidth={0}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={entry.category_name}
                      fill={
                        CATEGORY_COLORS[entry.category_name] ||
                        DEFAULT_COLORS[index % DEFAULT_COLORS.length]
                      }
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#201F1F',
                    border: '1px solid rgba(79, 70, 52, 0.3)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#E5E2E1',
                  }}
                  formatter={(value: unknown) => [formatCurrency(Number(value)), 'Ventas']}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <p className="text-lg font-bold text-primary font-mono">
                  {formatCurrency(total)}
                </p>
                <p className="text-[10px] text-on-surface-variant">Total</p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-4 space-y-2">
            {data.map((entry, index) => {
              const pct = total > 0 ? Math.round((Number(entry.total_sales) / total) * 100) : 0;
              const color =
                CATEGORY_COLORS[entry.category_name] ||
                DEFAULT_COLORS[index % DEFAULT_COLORS.length];
              return (
                <div key={entry.category_name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs text-on-surface-variant">{entry.category_name}</span>
                  </div>
                  <span className="text-xs font-semibold text-on-surface font-mono">{pct}%</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
