'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import { Product } from '@/types';
import regions from '@/data/regions';

interface Props {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

const inputClass = "w-full rounded-2xl border border-white/48 bg-white/78 px-3 py-2.5 text-sm text-[#263325] outline-none backdrop-blur transition-colors focus:border-[#7b9b70] focus:bg-white";
const labelClass = "mb-1 block text-sm font-medium text-[#6f6257]";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102115]/56 p-4 backdrop-blur-md" onClick={onClose}>
      <div className="pressed-paper max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[26px]" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 border-b border-white/38 bg-[#f4efe6]/86 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-[#b85c62]">ORDER</p>
              <h2 className="mt-1 text-lg font-semibold text-[#2f271f]">购买 {product.name}</h2>
            </div>
            <button onClick={onClose} className="rounded-full border border-[#dfd0bb] bg-white/60 px-3 py-1 text-xl leading-none text-[#8a7a6a] hover:bg-white">&times;</button>
          </div>
        </div>

        <div className="p-5">
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
	              <div className="flex gap-3 rounded-3xl border border-white/48 bg-white/58 p-3">
                <Image src={product.images[0] || '/placeholder.svg'} alt={product.name} width={80} height={80} className="h-20 w-20 rounded-2xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#2f271f]">{product.name}</p>
                  <p className="mt-1 text-sm text-[#817469]">库存 {product.stock} · {min > 1 ? `${min}份起购` : '单件可购'}</p>
                  <p className="mt-2 text-xl font-semibold text-[#b85c62]">¥{total}</p>
                </div>
              </div>

	              <div className="flex items-center justify-between rounded-3xl border border-white/42 bg-[#e9f0de]/68 p-3">
                <span className="text-sm text-[#6f6257]">数量{min > 1 ? `（${min}份起购）` : ''}</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setQty(Math.max(min, qty - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#cfbda5] bg-white text-[#6f6257]">−</button>
                  <span className="w-7 text-center font-semibold text-[#2f271f]">{qty}</span>
                  <button type="button" onClick={() => setQty(Math.min(product.stock, qty + 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#cfbda5] bg-white text-[#6f6257]">+</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>收件人 *</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="姓名" />
                </div>
                <div>
                  <label className={labelClass}>手机号 *</label>
                  <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} placeholder="11位手机号" />
                </div>
              </div>

              <div>
                <label className={labelClass}>所在地区 *</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={province}
                    onChange={(e) => { setProvince(e.target.value); setCity(''); setDistrict(''); }}
                    className={inputClass}
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
                    className={`${inputClass} disabled:bg-[#eee6dc] disabled:text-[#a29486]`}
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
                      className={inputClass}
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
                      className={inputClass}
                      placeholder="区/县"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>详细地址 *</label>
                <textarea
                  required
                  value={detail}
                  onChange={(e) => setDetail(e.target.value)}
                  onPaste={handlePaste}
                  rows={2}
                  className={`${inputClass} resize-none`}
                  placeholder="街道/小区/门牌号，可直接粘贴整段地址"
                />
                {fullAddress && (
                  <p className="mt-1 truncate text-xs text-[#9a8b7e]">地址预览：{fullAddress}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>备注（选填）</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} placeholder="颜色偏好、特殊要求等" />
              </div>

	              <button type="submit" className="w-full rounded-full bg-[#31523a] py-3 font-semibold text-white transition-colors hover:bg-[#263f2d]">
                下一步：付款 ¥{total}
              </button>
            </form>
          )}

          {step === 'pay' && (
            <div className="space-y-4 text-center">
              <p className="text-sm font-medium text-[#6f6257]">请扫码付款</p>
              <p className="text-4xl font-semibold text-[#b85c62]">¥{total}</p>

              <div className="grid grid-cols-2 gap-3">
	                <div className="rounded-3xl border border-white/48 bg-white/62 p-3">
                  <p className="mb-2 text-sm font-semibold text-[#3f7a4f]">微信支付</p>
                  <Image src="/api/uploads/wechat-pay.jpg" alt="微信收款码" width={144} height={144} className="mx-auto h-36 w-36 rounded-2xl object-contain shadow-sm" />
                </div>
	                <div className="rounded-3xl border border-white/48 bg-white/62 p-3">
                  <p className="mb-2 text-sm font-semibold text-[#3d6f9f]">支付宝</p>
                  <Image src="/api/uploads/alipay.jpg" alt="支付宝收款码" width={144} height={144} className="mx-auto h-36 w-36 rounded-2xl object-contain shadow-sm" />
                </div>
              </div>

              <p className="text-xs text-[#9a8b7e]">付款时请备注「{name}」</p>

              <button
                onClick={handlePaid}
                disabled={submitting}
                className="w-full rounded-full bg-[#3f5f47] py-3 font-semibold text-white transition-colors hover:bg-[#334e3a] disabled:opacity-50"
              >
                {submitting ? '处理中...' : '我已完成付款'}
              </button>
              <button onClick={() => setStep('form')} className="text-sm text-[#8a7a6a] hover:text-[#2f271f]">返回修改信息</button>
            </div>
          )}

          {step === 'done' && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#3f5f47] text-white">✓</div>
              <p className="text-lg font-semibold text-[#2f271f]">下单成功</p>
              <p className="mt-2 text-sm text-[#75685c]">库存已自动更新，做好后按地址发货即可。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
