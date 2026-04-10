import { useState } from 'react';
import { ProductGrid } from './ProductGrid';
import { CategoryTabs } from './CategoryTabs';
import { CartSidebar } from './CartSidebar';
import { ModifierModal } from './ModifierModal';
import { PaymentModal } from './PaymentModal';
import { useProducts, useCategories } from '../../hooks/useProducts';
import { Spinner } from '../ui/Spinner';
import { Search } from 'lucide-react';

export function POSView() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

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
        <div className="flex-1 overflow-y-auto p-6">
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
      <CartSidebar />

      {/* Modals */}
      <ModifierModal />
      <PaymentModal />
    </div>
  );
}
