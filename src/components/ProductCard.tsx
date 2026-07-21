'use client';

import { useState } from 'react';
import { Product } from '@/types';
import BuyModal from './BuyModal';

export default function ProductCard({ product }: { product: Product }) {
  const [showBuy, setShowBuy] = useState(false);
  const soldOut = product.stock === 0;

  return (
    <>
      <div className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group ${soldOut ? 'opacity-50' : ''}`}>
        <div className="aspect-square bg-gray-100 overflow-hidden relative">
          <img
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {soldOut && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <span className="bg-white text-gray-500 px-4 py-1 rounded-full text-sm font-bold shadow">
                已售罄
              </span>
            </div>
          )}
          {!soldOut && product.stock <= 5 && (
            <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
              仅剩{product.stock}件
            </div>
          )}
        </div>
        <div className="p-4">
          <span className="text-xs text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
            {product.category}
          </span>
          <h3 className="mt-2 font-medium text-gray-900 truncate">{product.name}</h3>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-bold text-rose-600">¥{product.price}</span>
            <span className={`text-xs ${soldOut ? 'text-red-400' : product.stock < 5 ? 'text-orange-400' : 'text-gray-400'}`}>
              {soldOut ? '已售罄' : `库存 ${product.stock}`}
            </span>
          </div>
          <button
            onClick={() => setShowBuy(true)}
            disabled={soldOut}
            className="mt-3 w-full bg-rose-500 text-white py-2 rounded-full text-sm font-medium hover:bg-rose-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {soldOut ? '已售罄' : '立即购买'}
          </button>
        </div>
      </div>

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
