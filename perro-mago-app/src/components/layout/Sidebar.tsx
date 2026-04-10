import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  History,
} from 'lucide-react';
import { useUIStore } from '../../stores/useUIStore';
import { cn } from '../../lib/utils';

const navItems = [
  { id: 'pos' as const, label: 'POS', icon: ShoppingCart },
  { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory' as const, label: 'Inventario', icon: Package },
  { id: 'history' as const, label: 'Historial', icon: History },
];

export function Sidebar() {
  const activePage = useUIStore((s) => s.activePage);
  const setActivePage = useUIStore((s) => s.setActivePage);

  return (
    <nav className="fixed md:static bottom-0 left-0 right-0 z-40 md:w-20 bg-surface-container-low flex md:flex-col items-center justify-around md:justify-start md:py-6 h-16 md:h-auto gap-2 shrink-0 border-t md:border-t-0 md:border-r border-outline-variant/30">
      {/* Logo (Desktop Only) */}
      <div className="hidden md:flex mb-6 flex-col items-center gap-1">
        <img src="/logo.png" alt="Perro Mago Logo" className="w-12 h-12 object-contain" />
      </div>

      {/* Nav Items */}
      <div className="flex md:flex-col gap-1 md:flex-1 w-full md:w-auto justify-around px-2 md:px-0">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                'flex-1 md:flex-none md:w-16 h-14 md:h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 relative',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              )}
              title={item.label}
            >
              {isActive && (
                <>
                  <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-primary" />
                  <div className="md:hidden absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full bg-primary" />
                </>
              )}
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} className="md:w-[22px] md:h-[22px]" />
              <span className="text-[10px] sm:text-xs md:text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
