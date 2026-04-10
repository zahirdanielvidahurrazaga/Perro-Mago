import { useState } from 'react';
import { ProductGrid } from './ProductGrid';
import { CategoryTabs } from './CategoryTabs';
import { CartSidebar } from './CartSidebar';
import { ModifierModal } from './ModifierModal';
import { PaymentModal } from './PaymentModal';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { useCartStore } from '../../stores/useCartStore';
import { Spinner } from '../ui/Spinner';
import { Search, ShoppingBag } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

export function POSView() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const cartItemCount = useCartStore((s) => s.getItemCount());
  const cartTotal = useCartStore((s) => s.getTotal());

  const isLoading = productsLoading || categoriesLoading;

  const filteredProducts = products?.filter((p) => {
    const matchesCategory = !activeCategory || p.category_id === activeCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex h-full">
      {/* Left: Product Grid */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 flex items-center gap-4 bg-surface-container-low/50">
          <h1 className="text-lg font-bold text-primary shrink-0">Punto de Venta</h1>
          
          <CategoryTabs
            categories={categories || []}
            activeCategory={activeCategory}
            onSelect={setActiveCategory}
          />

          {/* Search */}
          <div className="relative ml-auto">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
            />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-surface-container-lowest rounded-lg text-on-surface placeholder:text-on-surface-variant/50 outline-none focus:ring-1 focus:ring-primary w-48 transition-all focus:w-56"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size={32} />
            </div>
          ) : (
            <ProductGrid products={filteredProducts || []} />
          )}
        </div>
      </div>

      {/* Right: Cart Sidebar */}
      <div 
        className={cn(
          "fixed inset-0 z-50 lg:static lg:z-auto transition-transform duration-300",
          mobileCartOpen ? "translate-y-0" : "translate-y-full lg:translate-y-0 hidden lg:block"
        )}
      >
        <CartSidebar onClose={() => setMobileCartOpen(false)} isMobile={mobileCartOpen} />
      </div>

      {/* Mobile FAB for Cart */}
      {!mobileCartOpen && cartItemCount > 0 && (
        <button
          onClick={() => setMobileCartOpen(true)}
          className="lg:hidden fixed bottom-[80px] right-4 left-24 md:left-24 sm:left-auto bg-primary text-on-primary rounded-xl p-4 shadow-lg flex items-center justify-between z-40 brand-gradient mx-auto max-w-sm sm:w-auto"
        >
          <div className="flex items-center gap-2">
            <div className="bg-on-primary/20 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {cartItemCount}
            </div>
            <span className="font-semibold text-sm">Ver Orden</span>
          </div>
          <span className="font-bold font-mono ml-4">{formatCurrency(cartTotal)}</span>
        </button>
      )}

      {/* Modals */}
      <ModifierModal />
      <PaymentModal onCloseMobile={() => setMobileCartOpen(false)} />
    </div>
  );
}
