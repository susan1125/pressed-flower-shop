'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/types';
import BuyModal from './BuyModal';

export default function ProductCard({ product, onPurchaseComplete }: { product: Product; onPurchaseComplete?: () => void }) {
  const [showBuy, setShowBuy] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const soldOut = product.stock === 0;
  const images = product.images?.filter(Boolean) || ['/placeholder.svg'];
  const hasMultiple = images.length > 1;

  return (
    <>
      <article className={`pressed-paper group overflow-hidden rounded-[22px] transition-transform duration-300 hover:-translate-y-1 ${soldOut ? 'opacity-55' : ''}`}>
        <div className="relative aspect-square overflow-hidden bg-[#dfe8d8]">
          <Image
            src={images[imgIdx] || '/placeholder.svg'}
            alt={`${product.name}${hasMultiple ? ` · ${imgIdx + 1}` : ''}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {/* 多图切换 */}
          {hasMultiple && (
            <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1.5 p-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    i === imgIdx ? 'w-3 bg-white' : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
          {/* 左右箭头 */}
          {hasMultiple && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setImgIdx((imgIdx - 1 + images.length) % images.length); }}
                className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-1 text-xs text-[#333] opacity-0 transition-opacity group-hover:opacity-100"
              >‹</button>
              <button
                onClick={(e) => { e.stopPropagation(); setImgIdx((imgIdx + 1) % images.length); }}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-white/70 p-1 text-xs text-[#333] opacity-0 transition-opacity group-hover:opacity-100"
              >›</button>
            </>
          )}
          <div className="absolute left-3 top-3 rounded-full bg-white/82 px-3 py-1 text-xs font-semibold text-[#31523a] backdrop-blur">
            {product.category}
          </div>
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/12 backdrop-blur-[1px]">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#74685c] shadow-lg">
                已售罄
              </span>
            </div>
          )}
          {!soldOut && product.stock <= 5 && (
            <div className="absolute right-3 top-3 rounded-full bg-[#d97d53] px-3 py-1 text-xs font-semibold text-white shadow-sm">
              仅剩 {product.stock}
            </div>
          )}
        </div>

        <div className="flex flex-col p-2.5 sm:p-3">
          <h3 className="min-h-8 text-xs font-semibold leading-snug text-[#2c251f] sm:text-sm">{product.name}</h3>
          <p className="mt-0.5 line-clamp-1 text-[11px] leading-4 text-[#75685c]">{product.description}</p>
          {product.size && <p className="mt-0.5 text-[11px] text-[#98887b]">{product.size}</p>}
          <div className="mt-2 flex items-end justify-between gap-1.5 sm:mt-2.5 sm:gap-2">
            <div>
              <p className="text-[10px] text-[#98887b]">手作价</p>
              <p className="text-sm font-semibold text-[#b85c62] sm:text-base">¥{product.price}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowBuy(true)}
              disabled={soldOut}
              className={`shrink-0 rounded-full px-2.5 py-1.5 text-[11px] font-semibold transition-colors sm:px-3 sm:text-xs ${
                soldOut
                  ? 'bg-[#e5ddd3] text-[#91867a]'
                  : 'bg-[#31523a] text-white shadow-sm hover:bg-[#263f2d]'
              }`}
            >
              {soldOut ? '已售罄' : '立即购买'}
            </button>
          </div>
        </div>
      </article>

      {showBuy && (
        <BuyModal
          product={product}
          onClose={() => setShowBuy(false)}
          onSuccess={() => { setShowBuy(false); onPurchaseComplete?.(); }}
        />
      )}
    </>
  );
}
