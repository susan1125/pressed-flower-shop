'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, Category } from '@/types';
import CategoryFilter from '@/components/CategoryFilter';
import ProductCard from '@/components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | '全部'>('全部');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

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
        if (!cancelled) setProducts(data);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProducts();

    return () => {
      cancelled = true;
    };
  }, []);

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
    } finally {
      setLoading(false);
    }
  }

  function handleCategoryChange(cat: Category | '全部') {
    setActiveCategory(cat);
    loadProducts(cat);
  }

  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

  return (
    <div className="floral-page">
      <section className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.88fr_1.12fr] lg:px-8 lg:py-16">
        <div className="order-2 lg:order-1">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#cbc0b2] bg-white/70 px-4 py-2 text-sm font-medium text-[#7d6b56] shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#a8898b]" />
            真花压制 · 手作小物
          </div>

          <h1 className="max-w-xl text-5xl font-semibold leading-[1.06] tracking-normal text-[#3d362e] sm:text-6xl lg:text-7xl">
            把春天压进日常里
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#6d6258] sm:text-lg">
            押花小铺制作书签、台灯、团扇、画框与随身小物。每一片花瓣都来自真实花材，经过干燥、排版、封存后成为独一份作品。
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#products"
              className="rounded-full bg-[#3d362e] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(61,54,46,.16)] transition-transform hover:-translate-y-0.5"
            >
              查看作品
            </a>
            <a
              href="/admin"
              className="rounded-full border border-[#cbc0b2] bg-white/62 px-6 py-3 text-sm font-semibold text-[#6d5c48] backdrop-blur transition-colors hover:bg-white"
            >
              管理作品
            </a>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            <div className="flower-pill rounded-md p-4">
              <p className="text-2xl font-semibold text-[#3d362e]">{products.length || 13}</p>
              <p className="mt-1 text-xs text-[#8d7e6e]">在售品类</p>
            </div>
            <div className="flower-pill rounded-md p-4">
              <p className="text-2xl font-semibold text-[#3d362e]">{totalStock || 130}</p>
              <p className="mt-1 text-xs text-[#8d7e6e]">现货库存</p>
            </div>
            <div className="flower-pill rounded-md p-4">
              <p className="text-2xl font-semibold text-[#3d362e]">1:1</p>
              <p className="mt-1 text-xs text-[#8d7e6e]">手作成品</p>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="pressed-paper relative overflow-hidden rounded-[28px] p-4 sm:p-6">
            <div className="absolute left-6 top-6 z-10 rounded-full bg-white/72 px-4 py-2 text-sm font-semibold text-[#6d5c48] backdrop-blur">
              Floral window
            </div>
            <div className="relative aspect-[1.18/1] overflow-hidden rounded-[22px] bg-[#e5d9c8]">
              <Image
                src="/hero-pressed-flower.svg"
                alt="押花工作台和花材"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 54vw"
              />
            </div>
            <div className="absolute bottom-6 right-6 max-w-[15rem] rounded-2xl border border-white/60 bg-white/74 p-4 text-sm leading-6 text-[#6d5c48] shadow-lg backdrop-blur-md">
              花材会随季节更换，同款作品也保留自然差异。
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.22em] text-[#a8898b]">SHOP COLLECTION</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#3d362e] md:text-4xl">
              按花材与用途挑选
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[#7d7164]">
            所见即所得，库存售完后需要重新制作。喜欢的花色建议先下单锁定。
          </p>
        </div>

        <CategoryFilter active={activeCategory} onChange={handleCategoryChange} />

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-80 animate-pulse rounded-2xl bg-[#e2d7c8]/80" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="pressed-paper rounded-3xl px-6 py-20 text-center">
            <p className="text-lg font-semibold text-[#3d362e]">暂无作品</p>
            <p className="mt-2 text-sm text-[#8d8176]">新作品正在手工制作中，敬请期待。</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
