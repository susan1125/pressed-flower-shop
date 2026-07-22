'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Product, Category } from '@/types';
import CategoryFilter from '@/components/CategoryFilter';
import ProductCard from '@/components/ProductCard';
import BuyModal from '@/components/BuyModal';

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
  const [showcaseProduct, setShowcaseProduct] = useState<Product | null>(null);
  const [showcaseActive, setShowcaseActive] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

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

  async function handlePurchaseComplete() {
    try {
      const res = await fetch('/api/products', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) setProducts(await res.json());
    } catch {}
  }

  // 构建橱窗：优先取精选产品，没有则自动取有图产品，都不够再兜底
  const featuredWorks = products
    .filter((p) => p.featured && p.images[0] && p.images[0] !== '/placeholder.svg')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map((p) => ({ name: p.name, image: p.images[0], product: p }));
  const autoWorks = products
    .filter((p) => !p.featured && p.images[0] && p.images[0] !== '/placeholder.svg' && p.stock > 0)
    .slice(0, 6)
    .map((p) => ({ name: p.name, image: p.images[0], product: p }));
  const heroWorks = featuredWorks.length > 0
    ? featuredWorks
    : autoWorks.length >= 4 ? autoWorks : fallbackWorks.map((f) => ({ ...f, product: null }));

  return (
    <div className="floral-page">
      <section className="relative overflow-hidden md:min-h-[calc(100vh-64px)]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,29,20,.32),rgba(18,29,20,.18),rgba(18,29,20,.3))] md:bg-[linear-gradient(90deg,rgba(18,29,20,.62),rgba(18,29,20,.28),rgba(255,255,255,.06))]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f4efe6]/40 to-transparent md:h-44 md:from-[#f4efe6]/90" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-6 px-4 py-8 sm:px-6 md:min-h-[calc(100vh-64px)] lg:grid-cols-[0.82fr_1.18fr] lg:px-8 lg:gap-10 lg:py-14">
          <div className="text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/18 px-3 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-md sm:px-4 sm:py-2 sm:text-sm">
            <span className="h-2 w-2 rounded-full bg-[#b78d91]" />
            真花押制 · 每件不同
          </div>

          <h1 className="max-w-2xl text-5xl font-semibold leading-none tracking-normal sm:text-7xl lg:text-8xl">
            沁瓣
          </h1>
          <p className="mt-4 text-xl font-medium leading-tight text-[#fff6eb] sm:text-3xl">
            把花海的风，留在日常物件里
          </p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#fff3e4] sm:text-lg sm:leading-8">
            书签、团扇、镜子、笔记本和包包都使用真实花材制作。花瓣的颜色、位置和纹理会自然变化，所以每一件作品都只属于这一批。
          </p>

          <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
            <a
              href="#products"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#263325] shadow-[0_16px_35px_rgba(0,0,0,.22)] transition-transform hover:-translate-y-0.5 sm:px-6 sm:py-3"
            >
              查看作品
            </a>
            <a
              href="/admin"
              className="rounded-full border border-white/45 bg-white/16 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/24 sm:px-6 sm:py-3"
            >
              上传新作品
            </a>
          </div>

          <div className="mt-6 grid max-w-lg grid-cols-3 gap-2 sm:mt-10 sm:gap-3">
            <div className="rounded-2xl border border-white/24 bg-white/16 p-3 backdrop-blur-md sm:p-4">
              <p className="text-xl font-semibold sm:text-2xl">真花</p>
              <p className="mt-1 text-xs text-[#f6e9db]">自然押制</p>
            </div>
            <div className="rounded-2xl border border-white/24 bg-white/16 p-3 backdrop-blur-md sm:p-4">
              <p className="text-xl font-semibold sm:text-2xl">手作</p>
              <p className="mt-1 text-xs text-[#f6e9db]">每件不同</p>
            </div>
            <div className="rounded-2xl border border-white/24 bg-white/16 p-3 backdrop-blur-md sm:p-4">
              <p className="text-xl font-semibold sm:text-2xl">1:1</p>
              <p className="mt-1 text-xs text-[#f6e9db]">实物拍摄</p>
            </div>
          </div>
        </div>

          <div className="relative">
            <div className="absolute -right-7 -top-8 hidden h-32 w-32 rounded-full border border-white/30 bg-white/18 sm:block" />
            <div className="absolute -bottom-10 -left-8 hidden h-44 w-44 rounded-full bg-[#e7b4c1]/34 blur-2xl sm:block" />
            <div className="meadow-panel relative overflow-hidden rounded-[24px] p-3 sm:rounded-[30px] sm:p-5">
            <div className="mb-3 flex items-center justify-between px-1 sm:mb-4">
              <div>
                <p className="text-sm font-semibold text-white">沁瓣作品橱窗</p>
                <p className="mt-1 text-xs text-[#f5e8db]">来自当前店铺上传的实物图</p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#263325]">
                fresh
              </span>
            </div>

            <div className="relative group/carousel">
              {/* 左箭头 */}
              <button
                onClick={(e) => {
                  const el = (e.currentTarget.parentElement?.querySelector('.carousel-track') as HTMLElement);
                  if (el) el.scrollBy({ left: -el.clientWidth * 0.7, behavior: 'smooth' });
                }}
                className="absolute left-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/28 p-3 text-white shadow-lg backdrop-blur opacity-0 transition-opacity group-hover/carousel:opacity-100 hover:bg-white/50"
                aria-label="上一页"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              {/* 右箭头 */}
              <button
                onClick={(e) => {
                  const el = (e.currentTarget.parentElement?.querySelector('.carousel-track') as HTMLElement);
                  if (el) el.scrollBy({ left: el.clientWidth * 0.7, behavior: 'smooth' });
                }}
                className="absolute right-1 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/28 p-3 text-white shadow-lg backdrop-blur opacity-0 transition-opacity group-hover/carousel:opacity-100 hover:bg-white/50"
                aria-label="下一页"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              {/* 滚动轨道 */}
              <div
                ref={carouselRef}
                onScroll={(e) => {
                  const el = e.currentTarget;
                  const idx = Math.round(el.scrollLeft / el.clientWidth);
                  setShowcaseActive(idx);
                }}
                className="carousel-track flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {heroWorks.map((work: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => { if (work.product) setShowcaseProduct(work.product); }}
                    className={`relative shrink-0 snap-start overflow-hidden rounded-[18px] bg-[#e6dacb] shadow-lg sm:rounded-[22px] ${
                      work.product ? 'cursor-pointer group/hero' : ''
                    } w-[75vw] sm:w-[54vw] lg:w-[30vw]`}
                    style={{ aspectRatio: '4/5' }}
                  >
                    <Image
                      src={work.image} alt={work.name}
                      fill
                      priority={idx < 3}
                      className="object-cover transition-transform duration-500 group-hover/hero:scale-105"
                      sizes="(max-width: 640px) 75vw, (max-width: 1024px) 54vw, 30vw"
                    />
                    {work.product && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4 pt-12 opacity-60 transition-opacity group-hover/hero:opacity-100">
                        <p className="text-sm font-medium text-white truncate">{work.name}</p>
                        <p className="text-base font-bold text-white">¥{work.product.price}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {/* 页码指示点 */}
              {heroWorks.length > 1 && (
                <div className="mt-3 flex justify-center gap-1.5">
                  {heroWorks.map((_: any, idx: number) => (
                    <span
                      key={idx}
                      className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                        idx === showcaseActive ? 'w-4 bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      </section>

      <section id="products" className="meadow-soft-section px-4 pb-14 pt-10 sm:px-6 sm:pt-12 lg:px-8">
        <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 md:mb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-[0.22em] text-[#f4ddc8]">SHOP COLLECTION</p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl md:text-4xl">
              所有现货作品
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-[#fff3e4]">
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
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onPurchaseComplete={handlePurchaseComplete} />
            ))}
          </div>
        )}
        </div>
      </section>

      {showcaseProduct && (
        <BuyModal
          product={showcaseProduct}
          onClose={() => setShowcaseProduct(null)}
          onSuccess={() => { setShowcaseProduct(null); handlePurchaseComplete(); }}
        />
      )}
    </div>
  );
}
