import { DateFilter } from '../layout/DateFilter';
import { KPIRow } from './KPIRow';
import { SalesByHourChart } from './SalesByHourChart';
import { CategoryDonut } from './CategoryDonut';
import { TopProductsTable } from './TopProductsTable';
import { InventoryAlerts } from './InventoryAlerts';
import { Sparkles } from 'lucide-react';

export function DashboardView() {
  return (
    <div className="h-full overflow-y-auto">
      {/* Top Bar */}
      <div className="px-6 py-4 flex items-center justify-between bg-surface-container-low/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Sparkles size={20} className="text-primary" />
          <h1 className="text-lg font-bold text-on-surface">Admin Panel</h1>
          <span className="text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
            Dashboard
          </span>
        </div>
        <DateFilter />
      </div>

      <div className="p-6 space-y-6">
        {/* KPIs */}
        <KPIRow />

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SalesByHourChart />
          </div>
          <div>
            <CategoryDonut />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TopProductsTable />
          </div>
          <div>
            <InventoryAlerts />
          </div>
        </div>
      </div>
    </div>
  );
}
