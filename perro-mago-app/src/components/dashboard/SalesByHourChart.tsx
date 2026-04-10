import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useSalesByHour } from '../../hooks/useDashboard';
import { formatCurrency } from '../../lib/utils';
import { Spinner } from '../ui/Spinner';

export function SalesByHourChart() {
  const { data, isLoading } = useSalesByHour();

  return (
    <div className="bg-surface-container-high rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-on-surface">Volumen de Ventas por Hora</h3>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Rendimiento operativo 10:00 – 22:00
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={data || []}
            margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(79, 70, 52, 0.15)"
              vertical={false}
            />
            <XAxis
              dataKey="hour"
              tickFormatter={(h) => `${h}:00`}
              tick={{ fill: '#D3C5AE', fontSize: 11 }}
              axisLine={{ stroke: 'rgba(79, 70, 52, 0.15)' }}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              tick={{ fill: '#D3C5AE', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#201F1F',
                border: '1px solid rgba(79, 70, 52, 0.3)',
                borderRadius: '12px',
                fontSize: '12px',
                color: '#E5E2E1',
              }}
              formatter={(value: unknown) => [formatCurrency(Number(value)), 'Ventas']}
              labelFormatter={(h) => `${h}:00 hrs`}
              cursor={{ fill: 'rgba(246, 190, 57, 0.05)' }}
            />
            <Bar
              dataKey="total_sales"
              fill="url(#goldGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F6BE39" stopOpacity={1} />
                <stop offset="100%" stopColor="#D4A017" stopOpacity={0.7} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
