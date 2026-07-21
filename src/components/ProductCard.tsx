'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/types';
import BuyModal from './BuyModal';

export default function ProductCard({ product }: { product: Product }) {
  const [showBuy, setShowBuy] = useState(false);
  const soldOut = product.stock === 0;

  return (
    <>
      <article className={`pressed-paper group overflow-hidden rounded-[22px] ${soldOut ? 'opacity-55' : ''}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-[#e5d9c8]">
          <Image
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#a8898b] backdrop-blur">
            {product.category}
          </div>
          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/12 backdrop-blur-[1px]">
              <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#7d7064] shadow-lg">
                已售罄
              </span>
            </div>
          )}
          {!soldOut && product.stock <= 5 && (
            <div className="absolute right-3 top-3 rounded-full bg-[#c0a094] px-3 py-1 text-xs font-semibold text-white shadow-sm">
              仅剩 {product.stock}
            </div>
          )}
        </div>

        <div className="flex flex-col p-4">
          <h3 className="min-h-11 text-base font-semibold leading-snug text-[#3d362e]">{product.name}</h3>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#7d7164]">{product.description}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-[#9d8e7e]">手作价</p>
              <p className="text-xl font-semibold text-[#a8898b]">¥{product.price}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowBuy(true)}
              disabled={soldOut}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                soldOut
                  ? 'bg-[#e5ddd3] text-[#91867a]'
                  : 'bg-[#3d362e] text-white hover:bg-[#54483e]'
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
          onSuccess={() => { setShowBuy(false); window.location.reload(); }}
        />
      )}
    </>
  );
}
