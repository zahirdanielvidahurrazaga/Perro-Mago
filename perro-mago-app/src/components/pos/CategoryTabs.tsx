import type { Category } from '../../types/database';
import { cn } from '../../lib/utils';
import { Beef, Cookie, CupSoda } from 'lucide-react';

interface CategoryTabsProps {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (categoryId: string | null) => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  beef: <Beef size={16} />,
  fries: <Cookie size={16} />,
  'cup-soda': <CupSoda size={16} />,
};

export function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          'px-4 py-2 md:py-2.5 text-sm font-medium rounded-full transition-all duration-200 min-h-[48px] md:min-h-0 flex items-center justify-center',
          !activeCategory
            ? 'bg-primary text-on-primary'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
        )}
      >
        Todos
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            'px-4 py-2 md:py-2.5 text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-1.5 min-h-[48px] md:min-h-0',
            activeCategory === cat.id
              ? 'bg-primary text-on-primary'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
          )}
        >
          {cat.icon && categoryIcons[cat.icon]}
          {cat.name}
        </button>
      ))}
    </div>
  );
}
