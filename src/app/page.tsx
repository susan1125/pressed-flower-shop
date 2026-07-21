'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Product, Category } from '@/types';
import CategoryFilter from '@/components/CategoryFilter';
import ProductCard from '@/components/ProductCard';

const fallbackWorks = [
  { name: '押花书签', image: '/api/uploads/1784609775977-9ggq5m.jpg' },
  { name: '押花团扇', image: '/api/uploads/1784609828685-7kkdpo.jpg' },
  { name: '押花帆布包', image: '/api/uploads/1784609857009-49ylbw.jpg' },
  { name: '押花圆镜', image: '/api/uploads/1784609874847-htf0el.jpg' },
  { name: '押花笔记本', image: '/api/uploads/1784609891519-vvyc3j.jpg' },
  { name: '环形镜子', image: '/api/uploads/1784610179425-3bzsia.jpg' },
];

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | '全部'>('全部');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialProducts() {
      setLoading(true);
      try {
        const res = await fetch('/api/products', {
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

    void loadInitialProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  async function loadProducts(category?: string) {
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
  }

  function handleCategoryChange(cat: Category | '全部') {
    setActiveCategory(cat);
    loadProducts(cat);
  }

  async function handlePurchaseComplete() {
    // 静默刷新产品数据

    try {
      const res = await fetch('/api/products', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) setProducts(await res.json());
    } catch {}
  }

  const liveWorks = products
    .filter((product) => product.images[0] && product.images[0] !== '/placeholder.svg')
    .slice(0, 6)
    .map((product) => ({ name: product.name, image: product.images[0] }));
  const heroWorks = liveWorks.length >= 4 ? liveWorks : fallbackWorks;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);

  return (
    <div className="floral-page">
      <section className="relative min-h-[calc(100vh-64px)] overflow-hidden">
        <Image
          src="/brand/qinban-meadow.jpg"
          alt="蓝天湖畔花海"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,29,20,.72),rgba(18,29,20,.34),rgba(255,255,255,.08))]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f5efe7] to-transparent" />

        <div className="relative mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:py-14">
          <div className="text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/18 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-[#b78d91]" />
            真花押制 · 每件不同
          </div>

          <h1 className="max-w-2xl text-6xl font-semibold leading-[0.95] tracking-normal sm:text-7xl lg:text-8xl">
            沁瓣
          </h1>
          <p className="mt-5 text-2xl font-medium leading-tight text-[#fff6eb] sm:text-3xl">
            把花海的风，留在日常物件里
          </p>
          <p className="mt-6 max-w-xl text-base leading-8 text-[#fff3e4] sm:text-lg">
            书签、团扇、镜子、笔记本和包包都使用真实花材制作。花瓣的颜色、位置和纹理会自然变化，所以每一件作品都只属于这一批。
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#products"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#263325] shadow-[0_16px_35px_rgba(0,0,0,.22)] transition-transform hover:-translate-y-0.5"
            >
              查看作品
            </a>
            <a
              href="/admin"
              className="rounded-full border border-white/45 bg-white/16 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/24"
            >
              上传新作品
            </a>
          </div>

          <div className="mt-10 grid max-w-lg grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/24 bg-white/16 p-4 backdrop-blur-md">
              <p className="text-2xl font-semibold">{products.length || 13}</p>
              <p className="mt-1 text-xs text-[#f6e9db]">已录入作品</p>
            </div>
            <div className="rounded-2xl border border-white/24 bg-white/16 p-4 backdrop-blur-md">
              <p className="text-2xl font-semibold">{totalStock || 130}</p>
              <p className="mt-1 text-xs text-[#f6e9db]">现货库存</p>
            </div>
            <div className="rounded-2xl border border-white/24 bg-white/16 p-4 backdrop-blur-md">
              <p className="text-2xl font-semibold">1:1</p>
              <p className="mt-1 text-xs text-[#f6e9db]">实物拍摄</p>
            </div>
          </div>
        </div>

          <div className="relative">
            <div className="absolute -right-7 -top-8 h-32 w-32 rounded-full border border-white/30 bg-white/18" />
            <div className="absolute -bottom-10 -left-8 h-44 w-44 rounded-full bg-[#e7b4c1]/34 blur-2xl" />
            <div className="relative overflow-hidden rounded-[30px] border border-white/30 bg-white/22 p-4 shadow-[0_28px_80px_rgba(0,0,0,.22)] backdrop-blur-xl sm:p-5">
            <div className="mb-4 flex items-center justify-between px-1">
              <div>
                <p className="text-sm font-semibold text-white">沁瓣作品橱窗</p>
                <p className="mt-1 text-xs text-[#f5e8db]">来自当前店铺上传的实物图</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#263325]">
                fresh
              </span>
            </div>

            <div className="grid h-[500px] grid-cols-12 grid-rows-12 gap-3">
              <div className="relative col-span-7 row-span-7 overflow-hidden rounded-[22px] bg-[#e6dacb] shadow-lg">
                <Image src={heroWorks[0].image} alt={heroWorks[0].name} fill priority className="object-cover" sizes="(max-width: 1024px) 58vw, 32vw" />
              </div>
              <div className="relative col-span-5 row-span-5 overflow-hidden rounded-[22px] bg-[#e6dacb] shadow-lg">
                <Image src={heroWorks[1].image} alt={heroWorks[1].name} fill className="object-cover" sizes="(max-width: 1024px) 42vw, 22vw" />
              </div>
              <div className="relative col-span-5 row-span-4 overflow-hidden rounded-[22px] bg-[#e6dacb] shadow-lg">
                <Image src={heroWorks[2].image} alt={heroWorks[2].name} fill className="object-cover" sizes="(max-width: 1024px) 42vw, 22vw" />
              </div>
              <div className="relative col-span-4 row-span-5 overflow-hidden rounded-[22px] bg-[#e6dacb] shadow-lg">
                <Image src={heroWorks[3].image} alt={heroWorks[3].name} fill className="object-cover" sizes="(max-width: 1024px) 34vw, 18vw" />
              </div>
              <div className="relative col-span-4 row-span-5 overflow-hidden rounded-[22px] bg-[#e6dacb] shadow-lg">
                <Image src={heroWorks[4].image} alt={heroWorks[4].name} fill className="object-cover" sizes="(max-width: 1024px) 34vw, 18vw" />
              </div>
              <div className="relative col-span-4 row-span-3 overflow-hidden rounded-[22px] bg-[#e6dacb] shadow-lg">
                <Image src={heroWorks[5].image} alt={heroWorks[5].name} fill className="object-cover" sizes="(max-width: 1024px) 34vw, 18vw" />
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.22em] text-[#b78d91]">SHOP COLLECTION</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#312a23] md:text-4xl">
              所有现货作品
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[#7d7164]">
            这里展示的是当前店铺作品，售完后同款花材不一定能完全复刻。
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
              <ProductCard key={product.id} product={product} onPurchaseComplete={handlePurchaseComplete} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
