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

const PAGE_SIZE = 12;

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category | '全部'>('全部');
  const [loading, setLoading] = useState(true);
  const [showcaseProduct, setShowcaseProduct] = useState<Product | null>(null);
  const [showcaseActive, setShowcaseActive] = useState(0);
  const [scales, setScales] = useState<number[]>([]);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialProducts() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products?_t=${Date.now()}`, {
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
        ? `?category=${encodeURIComponent(category)}&_t=${Date.now()}`
        : `?_t=${Date.now()}`;
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
    setDisplayCount(PAGE_SIZE);
    loadProducts(cat);
  }

  // 当前显示的产品（分页）
  const visibleProducts = products.slice(0, displayCount);
  const hasMore = displayCount < products.length;

  async function handlePurchaseComplete() {
    try {
      const res = await fetch(`/api/products?_t=${Date.now()}`, {
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

  const rafRef = useRef<number>(0);

  // 滚动时计算 Dock 放大效果（用 RAF 保证 60fps 丝滑）
  function updateCarouselScales() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = carouselRef.current;
      if (!el || heroWorks.length === 0) return;
      const viewCenter = el.getBoundingClientRect().left + el.clientWidth / 2;
      const items = el.querySelectorAll('.carousel-item');
      const newScales: number[] = [];
      const maxScale = 1.1;
      const minScale = 0.88;
      const influence = el.clientWidth * 0.5;
      let closestIdx = 0, closestDist = Infinity;
      items.forEach((item, i) => {
        const rect = item.getBoundingClientRect();
        const dist = Math.abs((rect.left + rect.right) / 2 - viewCenter);
        if (dist < closestDist) { closestDist = dist; closestIdx = i; }
        const t = Math.max(0, 1 - dist / influence);
        newScales.push(minScale + (maxScale - minScale) * t * t);
      });
      setScales(newScales);
      setShowcaseActive(closestIdx);
    });
  }

  // 数据加载后初始化缩放
  useEffect(() => {
    const timer = setTimeout(() => updateCarouselScales(), 150);
    return () => { clearTimeout(timer); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [products]);

  return (
    <div className="floral-page">
      <section className="relative overflow-hidden md:min-h-[calc(100vh-64px)]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,29,20,.32),rgba(18,29,20,.18),rgba(18,29,20,.3))] md:bg-[linear-gradient(90deg,rgba(18,29,20,.62),rgba(18,29,20,.28),rgba(255,255,255,.06))]" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f4efe6]/40 to-transparent md:h-44 md:from-[#f4efe6]/90" />

        {/* 文字区域：桌面端橱窗 float 到右侧，文字自然环绕 */}
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 md:min-h-[calc(100vh-64px)] md:py-20 lg:px-8 lg:py-24">
          <div className="text-white">

            {/* 橱窗：桌面端 float right 形成环绕效果 */}
            <div className="showcase-float">
              <div className="meadow-panel relative overflow-hidden rounded-[24px] p-3 sm:rounded-[30px] sm:p-5">
                <div className="mb-3 flex items-center justify-between px-1 sm:mb-4">
                  <div>
                    <p className="text-sm font-semibold text-white">沁瓣作品橱窗</p>
                    <p className="mt-1 text-xs text-[#f5e8db]">滑动浏览 · 点击选购</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#263325]">fresh</span>
                </div>
                <div className="relative group/carousel">
                  <div
                    ref={carouselRef}
                    onScroll={updateCarouselScales}
                    className="carousel-track flex items-center gap-2 overflow-x-auto scroll-smooth py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    style={{ paddingLeft: 'calc(50% - 60px)', paddingRight: 'calc(50% - 60px)' }}
                  >
                    {heroWorks.map((work: any, idx: number) => (
                      <div
                        key={idx}
                        onClick={() => { if (work.product) setShowcaseProduct(work.product); }}
                        className={`carousel-item relative shrink-0 overflow-hidden rounded-[18px] bg-[#e6dacb] shadow-lg transition-transform duration-200 ease-out sm:rounded-[22px] ${work.product ? 'cursor-pointer' : ''}`}
                        style={{
                          width: 'clamp(120px, 36vw, 220px)',
                          aspectRatio: '4/5',
                          transform: scales[idx] ? `scale(${scales[idx]})` : 'scale(0.88)',
                        }}
                      >
                        <Image src={work.image} alt={work.name} fill priority={idx < 1} className="object-cover" sizes="(max-width: 640px) 120px, (max-width: 1024px) 36vw, 220px" />
                        {work.product && (
                          <div className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3 pt-10 transition-opacity ${scales[idx] && scales[idx] > 1.05 ? 'opacity-100' : 'opacity-0'}`}>
                            <p className="text-xs font-medium text-white truncate">{work.name}</p>
                            <p className="text-sm font-bold text-white">¥{work.product.price}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 文字：在橱窗左侧自然流动 */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/18 px-4 py-2 text-xs font-medium text-white shadow-sm backdrop-blur-md sm:text-sm">
                <span className="h-2 w-2 rounded-full bg-[#b78d91]" />
                真花押制 · 每件不同
              </div>

              <p className="text-[11px] font-semibold tracking-[0.3em] text-[#f4ddc8]/60 uppercase sm:text-xs">QINBAN</p>
              <h1 className="mt-1 text-7xl font-bold leading-none tracking-[-0.03em] sm:text-[8rem] lg:text-[6.5rem] xl:text-[8rem]">沁瓣</h1>
              <h2 className="mt-3 text-5xl font-bold tracking-[0.06em] text-[#f4ddc8]/90 sm:text-6xl lg:text-7xl xl:text-8xl">押花艺术</h2>
              <p className="mt-1 text-[11px] font-medium tracking-[0.22em] text-[#f4ddc8]/50 uppercase sm:text-xs">Pressed Flower Atelier</p>

              <p className="mt-6 text-base leading-relaxed text-[#fff6eb] sm:text-lg sm:leading-snug">把花海的风，留在日常物件里</p>
              <p className="mt-3 max-w-xl text-sm leading-7 text-[#fff3e4]/75 sm:leading-8">书签、团扇、灯笼、包包等均使用真花制作。每一片花瓣都独一无二，你的也是。</p>

              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#products" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#263325] shadow-[0_16px_35px_rgba(0,0,0,.22)] transition-transform hover:-translate-y-0.5">
                  查看作品
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </a>
                <a href="/admin" className="inline-flex items-center gap-2 rounded-full border border-white/45 bg-white/16 px-6 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/24">
                  管理作品
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </a>
              </div>

              <div className="mt-7 flex gap-4">
                <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-md">
                  <span className="text-2xl">🌸</span>
                  <div><p className="text-xs font-semibold tracking-wide">真花</p><p className="text-[10px] text-[#f6e9db]">自然押制</p></div>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-md">
                  <span className="text-2xl">✋</span>
                  <div><p className="text-xs font-semibold tracking-wide">手作</p><p className="text-[10px] text-[#f6e9db]">每件不同</p></div>
                </div>
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
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} onPurchaseComplete={handlePurchaseComplete} />
              ))}
            </div>
            {hasMore && (
              <div className="mt-8 text-center">
                <button onClick={() => setDisplayCount((prev) => prev + PAGE_SIZE)} className="rounded-full border border-white/40 bg-white/14 px-8 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/24">
                  查看更多（还有 {products.length - displayCount} 件）
                </button>
              </div>
            )}
          </>
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
