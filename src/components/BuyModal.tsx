'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import { Product } from '@/types';
import regions from '@/data/regions';

type PayMethod = 'wechat' | 'alipay' | null;

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
  const [payMethod, setPayMethod] = useState<PayMethod>(null);
  const [orderId, setOrderId] = useState('');

  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [detail, setDetail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');

  const total = product.price * qty;

  const cities = useMemo(() => {
    const p = regions.find((r) => r.value === province);
    return p?.children || [];
  }, [province]);

  const districts = useMemo(() => {
    if (!city) return [];
    const c = cities.find((r) => r.value === city);
    return c?.children || [];
  }, [city, cities]);

  const fullAddress = [
    regions.find((r) => r.value === province)?.label || '',
    cities.find((r) => r.value === city)?.label || '',
    districts.find((r) => r.value === district)?.label || '',
    detail,
  ].filter(Boolean).join('');

  function handlePaste(e: React.ClipboardEvent<HTMLTextAreaElement>) {
    const text = e.clipboardData.getData('text');
    const phoneMatch = text.match(/1[3-9]\d{9}/);
    if (phoneMatch && !phone) setPhone(phoneMatch[0]);
  }

  function copyAmount() {
    navigator.clipboard.writeText(String(total)).then(() => {}, () => {});
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
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ product: { id: product.id, name: product.name, price: product.price }, quantity: qty }],
          total,
          customer: { name, phone, address: fullAddress, note },
          status: 'pending',
        }),
      });
      const order = await res.json();
      setOrderId(order.id);

      await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: Math.max(0, product.stock - qty) }),
      });
    } catch {}
    setSubmitting(false);
    setStep('done');
    setTimeout(() => onSuccess(), 2000);
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
                  <button type="button" onClick={() => setQty(Math.max(min, qty - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#cfbda5] bg-white text-[#6f6257]">-</button>
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
                  <select value={province} onChange={(e) => { setProvince(e.target.value); setCity(''); setDistrict(''); }} className={inputClass}>
                    <option value="">省/直辖市</option>
                    {regions.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
                  </select>
                  <select value={city} onChange={(e) => { setCity(e.target.value); setDistrict(''); }} disabled={cities.length === 0} className={`${inputClass} disabled:bg-[#eee6dc] disabled:text-[#a29486]`}>
                    <option value="">市</option>
                    {cities.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
                  </select>
                  {districts.length > 0 ? (
                    <select value={district} onChange={(e) => setDistrict(e.target.value)} className={inputClass}>
                      <option value="">区/县</option>
                      {districts.map((r) => (<option key={r.value} value={r.value}>{r.label}</option>))}
                    </select>
                  ) : (
                    <input value={district} onChange={(e) => setDistrict(e.target.value)} className={inputClass} placeholder="区/县" />
                  )}
                </div>
              </div>

              <div>
                <label className={labelClass}>详细地址 *</label>
                <textarea required value={detail} onChange={(e) => setDetail(e.target.value)} onPaste={handlePaste} rows={2} className={`${inputClass} resize-none`} placeholder="街道/小区/门牌号，可直接粘贴整段地址" />
                {fullAddress && (<p className="mt-1 truncate text-xs text-[#9a8b7e]">地址预览：{fullAddress}</p>)}
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

          {/* ── 选择支付方式 ── */}
          {step === 'pay' && !payMethod && (
            <div className="space-y-4 text-center">
              <p className="text-lg font-semibold text-[#2f271f]">选择支付方式</p>
              <p className="text-3xl font-bold text-[#b85c62]">¥{total}</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => { setPayMethod('wechat'); copyAmount(); }} className="rounded-2xl border-2 border-[#3f7a4f] bg-[#e9f5eb] p-6 text-center transition-colors hover:bg-[#d4ecd7]">
                  <p className="text-4xl mb-3">💚</p>
                  <p className="font-semibold text-[#2f7a3f]">微信支付</p>
                  <p className="mt-1 text-xs text-[#5a8a5f]">金额已自动复制</p>
                </button>
                <button onClick={() => { setPayMethod('alipay'); copyAmount(); }} className="rounded-2xl border-2 border-[#3d6f9f] bg-[#e9f0f8] p-6 text-center transition-colors hover:bg-[#d4e3f0]">
                  <p className="text-4xl mb-3">💙</p>
                  <p className="font-semibold text-[#2f5f9f]">支付宝</p>
                  <p className="mt-1 text-xs text-[#5a7aaf]">金额已自动复制</p>
                </button>
              </div>
              <button onClick={() => setStep('form')} className="text-sm text-[#8a7a6a] hover:text-[#2f271f]">返回修改信息</button>
            </div>
          )}

          {/* ── 展示收款码 ── */}
          {step === 'pay' && payMethod && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-[#6f6257]">{payMethod === 'wechat' ? '微信扫一扫' : '支付宝扫一扫'}</p>
              <p className="text-4xl font-bold text-[#b85c62]">¥{total}</p>

              <div className="mx-auto w-48 h-48 rounded-2xl overflow-hidden bg-white shadow-sm">
                <Image
                  src={payMethod === 'wechat' ? '/uploads/wechat-pay.jpg' : '/uploads/alipay.jpg'}
                  alt={payMethod === 'wechat' ? '微信收款码' : '支付宝收款码'}
                  width={192} height={192}
                  className="w-full h-full object-contain"
                />
              </div>

              <button onClick={copyAmount} className="rounded-full border border-[#cfbda5] bg-white px-4 py-2 text-sm font-medium text-[#6f6257] hover:bg-gray-50">
                复制金额 ¥{total}
              </button>

              <p className="text-xs text-[#9a8b7e]">付款时请备注「{name}」</p>

              <div className="flex gap-2">
                <button onClick={() => setPayMethod(null)} className="flex-1 rounded-full border border-[#dfd0bb] py-3 text-sm font-medium text-[#6f6257] hover:bg-white">换支付方式</button>
                <button onClick={handlePaid} disabled={submitting} className="flex-1 rounded-full bg-[#31523a] py-3 font-semibold text-white transition-colors hover:bg-[#263f2d] disabled:opacity-50">
                  {submitting ? '处理中...' : '我已完成付款'}
                </button>
              </div>
              <button onClick={() => setStep('form')} className="text-sm text-[#8a7a6a] hover:text-[#2f271f]">返回修改信息</button>
            </div>
          )}

          {/* ── 下单完成 ── */}
          {step === 'done' && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0c040] text-white text-2xl">✓</div>
              <p className="text-lg font-semibold text-[#2f271f]">下单成功，等待确认</p>
              <div className="mt-3 mx-auto max-w-[16rem] rounded-2xl bg-[#faf6ef] border border-[#e5d8c0] p-4">
                <p className="text-xs text-[#9a8b7e]">订单号</p>
                <p className="mt-1 text-sm font-mono font-semibold text-[#2f271f] break-all">{orderId}</p>
              </div>
              <p className="mt-3 text-sm text-[#8d8176]">请确认已完成付款，备注「{name}」</p>
              {payMethod && (
                <p className="mt-1 text-xs text-[#9a8b7e]">已选{payMethod === 'wechat' ? '微信' : '支付宝'}，店主核对到账后发货</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
