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
        <div className="pressed-paper rounded-3xl py-20 text-center">
          <p className="text-lg font-semibold text-[#3b332d]">暂无作品</p>
          <p className="mt-2 text-sm text-[#8d8176]">敬请期待更多沁瓣手作。</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </>
  );
}
