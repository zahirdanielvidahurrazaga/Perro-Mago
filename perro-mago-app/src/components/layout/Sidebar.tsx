import {
  ShoppingCart,
  LayoutDashboard,
  Package,
  History,
  Sparkles,
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
    <nav className="w-20 bg-surface-container-low flex flex-col items-center py-6 gap-2 shrink-0">
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center gap-1">
        <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
          <Sparkles size={24} className="text-on-primary" />
        </div>
        <span className="text-[10px] font-bold text-primary tracking-wider">PERRO</span>
        <span className="text-[10px] font-bold text-on-surface-variant -mt-1 tracking-wider">MAGO</span>
      </div>

      {/* Nav Items */}
      <div className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={cn(
                'w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
              )}
              title={item.label}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-8 rounded-r-full bg-primary" />
              )}
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
