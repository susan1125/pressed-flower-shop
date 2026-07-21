'use client';

import { useState } from 'react';
import { Product, Category } from '@/types';
import CategoryFilter from './CategoryFilter';
import ProductCard from './ProductCard';

export default function ProductList({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState<Category | '全部'>('全部');

  const filtered = activeCategory === '全部'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <>
      <CategoryFilter active={activeCategory} onChange={setActiveCategory} />

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">暂无产品</p>
          <p className="text-gray-300 mt-2">敬请期待更多手工压花作品</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
