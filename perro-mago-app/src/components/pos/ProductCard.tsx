import type { Product, Category } from '../../types/database';
import { useCartStore } from '../../stores/useCartStore';
import { useUIStore } from '../../stores/useUIStore';
import { formatCurrency } from '../../lib/utils';
import { Beef, Cookie, CupSoda, Droplets, Plus } from 'lucide-react';

interface ProductCardProps {
  product: Product & { category: Category };
}

const categoryIconMap: Record<string, React.ReactNode> = {
  hamburguesas: <Beef size={32} className="text-primary" />,
  complementos: <Cookie size={32} className="text-tertiary" />,
  bebidas: <CupSoda size={32} className="text-success" />,
};

const categoryBgMap: Record<string, string> = {
  hamburguesas: 'from-amber-900/20 to-transparent',
  complementos: 'from-blue-900/20 to-transparent',
  bebidas: 'from-emerald-900/20 to-transparent',
};

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const openModifierModal = useUIStore((s) => s.openModifierModal);
  const categorySlug = product.category?.slug || '';

  const handleClick = () => {
    if (product.has_modifiers) {
      openModifierModal(product.id);
    } else {
      addItem(
        {
          id: product.id,
          name: product.name,
          price: product.price,
          categoryName: product.category?.name || '',
        },
        [],
        ''
      );
    }
  };

  const isWater = product.name.toLowerCase().includes('agua');

  return (
    <button
      onClick={handleClick}
      className="group bg-surface-container-high rounded-xl p-4 text-left transition-all duration-200 hover:ghost-border-active hover:brightness-105 active:scale-[0.97] flex flex-col min-h-[160px] relative overflow-hidden"
    >
      {/* Background gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${categoryBgMap[categorySlug] || ''} opacity-50`}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Icon */}
        <div className="mb-3 w-14 h-14 rounded-xl bg-surface-container-lowest/50 flex items-center justify-center">
          {isWater ? (
            <Droplets size={28} className="text-success" />
          ) : (
            categoryIconMap[categorySlug] || <CupSoda size={28} className="text-on-surface-variant" />
          )}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-sm text-on-surface leading-tight mb-1">
          {product.name}
        </h3>

        {/* Price */}
        <p className="text-primary font-bold text-base mt-auto font-mono">
          {formatCurrency(product.price)}
        </p>
      </div>

      {/* Add indicator */}
      <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <Plus size={14} className="text-primary" />
      </div>
    </button>
  );
}
