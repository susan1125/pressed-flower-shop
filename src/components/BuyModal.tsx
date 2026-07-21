'use client';

import { useState, useMemo } from 'react';
import { Product } from '@/types';
import regions, { type Region } from '@/data/regions';

interface Props {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

function findRegion(value: string): Region | undefined {
  for (const p of regions) {
    if (p.value === value) return p;
    if (p.children) {
      for (const c of p.children) {
        if (c.value === value) return c;
      }
    }
  }
}

export default function BuyModal({ product, onClose, onSuccess }: Props) {
  const min = product.minOrder || 1;
  const [qty, setQty] = useState(min);
  const [step, setStep] = useState<'form' | 'pay' | 'done'>('form');
  const [submitting, setSubmitting] = useState(false);

  // Address state
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [detail, setDetail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const total = product.price * qty;

  // Cascading options
  const cities = useMemo(() => {
    const p = regions.find((r) => r.value === province);
    return p?.children || [];
  }, [province]);

  const districts = useMemo(() => {
    if (!city) return [];
    const c = cities.find((r) => r.value === city);
    return c?.children || [];
  }, [city, cities]);

  // Build full address
  const fullAddress = [
    regions.find((r) => r.value === province)?.label || '',
    cities.find((r) => r.value === city)?.label || '',
    districts.find((r) => r.value === district)?.label || '',
    detail,
  ].filter(Boolean).join('');

  // Smart paste: try to extract name/phone from clipboard
  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const text = e.clipboardData.getData('text');
    // Try to match: "姓名 138xxxx 地址"
    const phoneMatch = text.match(/1[3-9]\d{9}/);
    if (phoneMatch && !phone) {
      setPhone(phoneMatch[0]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !province || !detail.trim()) {
      alert('请填写完整的收货信息');
      return;
    }
    setStep('pay');
  }

  async function handlePaid() {
    setSubmitting(true);
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ product: { id: product.id, name: product.name, price: product.price }, quantity: qty }],
        total,
        customer: { name, phone, address: fullAddress, note },
        status: 'paid',
      }),
    });
    await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: Math.max(0, product.stock - qty) }),
    });
    setSubmitting(false);
    setStep('done');
    setTimeout(() => onSuccess(), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="font-bold text-lg">购买 {product.name}</h2>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-xl leading-none">&times;</button>
        </div>

        <div className="p-5">
          {/* ─── Step 1: Info form ─── */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Qty & Price */}
              <div className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                <span className="text-sm text-gray-500">数量{min > 1 ? `（${min}份起购）` : ''}</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setQty(Math.max(min, qty - 1))} className="w-7 h-7 rounded-full border flex items-center justify-center text-gray-500">−</button>
                  <span className="w-6 text-center font-medium">{qty}</span>
                  <button type="button" onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-7 h-7 rounded-full border flex items-center justify-center text-gray-500">+</button>
                </div>
              </div>
              <div className="text-right">
                <span className="text-sm text-gray-400">合计 </span>
                <span className="text-xl font-bold text-rose-600">¥{total}</span>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">收件人 *</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-300" placeholder="姓名" />
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">手机号 *</label>
                  <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-300" placeholder="11位手机号" />
                </div>
              </div>

              {/* Cascading region selectors */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">所在地区 *</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={province}
                    onChange={(e) => { setProvince(e.target.value); setCity(''); setDistrict(''); }}
                    className="border rounded-xl px-2 py-2.5 text-sm focus:outline-none focus:border-rose-300 bg-white"
                  >
                    <option value="">省/直辖市</option>
                    {regions.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>

                  <select
                    value={city}
                    onChange={(e) => { setCity(e.target.value); setDistrict(''); }}
                    disabled={cities.length === 0}
                    className="border rounded-xl px-2 py-2.5 text-sm focus:outline-none focus:border-rose-300 bg-white disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    <option value="">市</option>
                    {cities.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>

                  {districts.length > 0 ? (
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="border rounded-xl px-2 py-2.5 text-sm focus:outline-none focus:border-rose-300 bg-white"
                    >
                      <option value="">区/县</option>
                      {districts.map((r) => (
                        <option key={r.value} value={r.value}>{r.label}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="border rounded-xl px-2 py-2.5 text-sm focus:outline-none focus:border-rose-300 bg-white"
                      placeholder="区/县"
                    />
                  )}
                </div>
              </div>

              {/* Detail address */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">详细地址 *</label>
                <textarea
                  required
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  onPaste={handlePaste}
                  rows={2}
                  className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-300 resize-none"
                  placeholder="街道/小区/门牌号，可直接粘贴整段地址"
                />
                {fullAddress && (
                  <p className="mt-1 text-xs text-gray-400 truncate">📍 {fullAddress}</p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm text-gray-500 mb-1">备注（选填）</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rose-300" placeholder="颜色偏好、特殊要求等" />
              </div>

              <button type="submit" className="w-full bg-rose-500 text-white py-3 rounded-full font-medium hover:bg-rose-600">
                下一步：付款 ¥{total}
              </button>
            </form>
          )}

          {/* ─── Step 2: Payment ─── */}
          {step === 'pay' && (
            <div className="space-y-4 text-center">
              <p className="text-gray-500 text-sm">请扫码付款</p>
              <p className="text-3xl font-bold text-rose-600">¥{total}</p>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-2">💚 微信支付</p>
                  <img src="/api/uploads/wechat-pay.jpg" alt="微信收款码" className="w-40 h-40 mx-auto rounded-xl object-contain shadow-sm" />
                </div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium text-blue-600 mb-2">💙 支付宝</p>
                  <img src="/api/uploads/alipay.jpg" alt="支付宝收款码" className="w-40 h-40 mx-auto rounded-xl object-contain shadow-sm" />
                </div>
              </div>

              <p className="text-xs text-gray-400">付款时请备注「{name}」</p>

              <button
                onClick={handlePaid}
                disabled={submitting}
                className="w-full bg-green-500 text-white py-3 rounded-full font-medium hover:bg-green-600 disabled:opacity-50"
              >
                {submitting ? '处理中...' : '✅ 我已完成付款'}
              </button>
              <button onClick={() => setStep('form')} className="text-sm text-gray-400 hover:text-gray-600">← 返回修改信息</button>
            </div>
          )}

          {/* ─── Step 3: Done ─── */}
          {step === 'done' && (
            <div className="text-center py-6 space-y-3">
              <p className="text-4xl">✅</p>
              <p className="text-lg font-bold text-gray-900">下单成功！</p>
              <p className="text-sm text-gray-500">库存已自动更新</p>
              <p className="text-sm text-gray-400">做好后按地址发货即可</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
