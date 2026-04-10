import type { Product, Category } from '../../types/database';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: (Product & { category: Category })[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-on-surface-variant">
        <p>No se encontraron productos</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
