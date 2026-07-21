'use client';

import { useState, useEffect } from 'react';
import { Product, Category } from '@/types';
import CategoryFilter from '@/components/CategoryFilter';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | '全部'>('全部');
  const [loading, setLoading] = useState(true);

  async function loadProducts(category?: string) {
    setLoading(true);
    try {
      const params = category && category !== '全部'
        ? `?category=${encodeURIComponent(category)}`
        : '';
      const res = await fetch(`/api/products${params}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setProducts(data);
    } catch {
      setProducts([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function handleCategoryChange(cat: Category | '全部') {
    setActiveCategory(cat);
    loadProducts(cat);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Banner */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          🌸 压花小铺
        </h1>
        <p className="text-gray-500 text-lg mb-2">
          手工压花文创 · 现场制作 · 独一无二
        </p>
        <p className="text-sm text-gray-400">
          每件作品均为纯手工制作，花材随季节变化，所见即所得
        </p>
      </div>

      {/* Category */}
      <CategoryFilter active={activeCategory} onChange={handleCategoryChange} />

      {/* Products */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">加载中...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">暂无作品</p>
          <p className="text-gray-300 mt-2">新作品正在手工制作中，敬请期待</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
