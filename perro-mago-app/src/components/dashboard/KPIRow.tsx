import { DollarSign, TrendingUp, Receipt } from 'lucide-react';
import { useDashboardKPIs } from '../../hooks/useDashboard';
import { formatCurrency, cn } from '../../lib/utils';
import { Spinner } from '../ui/Spinner';

export function KPIRow() {
  const { data: kpis, isLoading } = useDashboardKPIs();

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface-container-high rounded-xl p-5 h-28 flex items-center justify-center">
            <Spinner size={20} />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      label: 'Ventas del Día',
      value: formatCurrency(kpis?.total_sales || 0),
      sublabel: `${kpis?.order_count || 0} órdenes`,
      icon: DollarSign,
      color: 'text-primary',
      bgColor: 'bg-amber-900/20',
    },
    {
      label: 'Ticket Promedio',
      value: formatCurrency(kpis?.average_ticket || 0),
      sublabel: '—',
      icon: Receipt,
      color: 'text-tertiary',
      bgColor: 'bg-blue-900/20',
    },
    {
      label: 'Crecimiento Semanal',
      value: `${(kpis?.growth_pct || 0) >= 0 ? '+' : ''}${kpis?.growth_pct || 0}%`,
      sublabel: `vs ${formatCurrency(kpis?.prev_sales || 0)} anterior`,
      icon: TrendingUp,
      color: (kpis?.growth_pct || 0) >= 0 ? 'text-success' : 'text-error',
      bgColor: (kpis?.growth_pct || 0) >= 0 ? 'bg-emerald-900/20' : 'bg-red-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-surface-container-high rounded-xl p-5 flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider mb-1">
                {card.label}
              </p>
              <p className={cn('text-2xl font-bold font-mono', card.color)}>
                {card.value}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">{card.sublabel}</p>
            </div>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', card.bgColor)}>
              <Icon size={20} className={card.color} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
