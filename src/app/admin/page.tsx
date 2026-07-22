'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Product, Category, CATEGORIES } from '@/types';

export default function AdminPage() {
  const [authReady, setAuthReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');

  useEffect(() => {
    setLoggedIn(localStorage.getItem('admin_auth') === 'true');
    setAuthReady(true);
  }, []);

  const handleLogin = () => {
    if (password === 'yahua2026') {
      setLoggedIn(true);
      localStorage.setItem('admin_auth', 'true');
    } else {
      alert('密码错误');
    }
  };

  if (!authReady) {
    return (
      <div className="floral-page mx-auto flex min-h-[calc(100vh-64px)] max-w-sm items-center px-4 py-20">
        <div className="meadow-panel w-full rounded-[28px] p-6 text-center text-white">
          <p className="text-sm font-medium text-[#fff3e4]">正在进入沁瓣后台...</p>
        </div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="floral-page mx-auto flex min-h-[calc(100vh-64px)] max-w-sm items-center px-4 py-20">
        <div className="meadow-panel w-full rounded-[28px] p-6">
          <p className="text-center text-sm font-semibold tracking-[0.22em] text-[#f4ddc8]">QINBAN ADMIN</p>
          <h1 className="mt-3 text-center text-3xl font-semibold text-white">沁瓣管理后台</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="mt-6 w-full rounded-2xl border border-white/45 bg-white/82 px-4 py-3 text-sm text-[#263325] outline-none backdrop-blur focus:border-white"
            placeholder="请输入管理密码"
          />
          <button
            onClick={handleLogin}
            className="mt-3 w-full rounded-full bg-white py-3 font-semibold text-[#263325] shadow-[0_16px_35px_rgba(0,0,0,.18)] transition-transform hover:-translate-y-0.5"
          >
            登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="floral-page mx-auto min-h-[calc(100vh-64px)] max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="meadow-panel mb-6 flex flex-col gap-5 rounded-[30px] p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[#f4ddc8]">QINBAN STUDIO</p>
            <h1 className="mt-2 text-2xl font-semibold">沁瓣管理后台</h1>
          </div>
          <Link href="/" className="rounded-full border border-white/45 bg-white/18 px-3 py-1 text-xs text-white backdrop-blur transition-colors hover:bg-white/28">
            回到店铺
          </Link>
        </div>
        <button
          onClick={() => { localStorage.removeItem('admin_auth'); setLoggedIn(false); }}
          className="self-start rounded-full border border-white/35 bg-white/14 px-4 py-2 text-sm text-white backdrop-blur transition-colors hover:bg-white/24 sm:self-auto"
        >
          退出
        </button>
      </div>

      <TabManager />
    </div>
  );
}

type Tab = 'products' | 'orders';

function TabManager() {
  const [tab, setTab] = useState<Tab>('products');

  return (
    <>
      <div className="mb-6 flex gap-2">
        {([
          ['products', '📦 产品管理'],
          ['orders', '📋 订单地址'],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-white text-[#263325] shadow-sm'
                : 'meadow-panel text-white/80 hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'products' ? <ProductManager /> : <OrderManager />}
    </>
  );
}

function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [gallery, setGallery] = useState<string[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchProducts(); loadGallery(); }, []);

  async function loadGallery() {
    try {
      const res = await fetch('/api/uploads');
      setGallery(await res.json());
    } catch {}
  }

  async function fetchProducts() {
    const res = await fetch('/api/products?admin=true', { cache: 'no-store' });
    setProducts(await res.json());
  }

  async function handleDelete(id: string) {
    if (!confirm('确定删除吗？')) return;
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  }

  async function handleDuplicate(product: Product) {
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: product.name + '·新',
        category: product.category,
        price: product.price,
        description: '',
        images: ['/placeholder.svg'],
        stock: 1,
        minOrder: product.minOrder || 1,
      }),
    });
    fetchProducts();
  }

  async function handleStockChange(product: Product, delta: number) {
    const newStock = Math.max(0, product.stock + delta);
    await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: newStock }),
    });
    fetchProducts();
  }

  async function handleToggleFeatured(product: Product) {
    await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !product.featured }),
    });
    fetchProducts();
  }

  async function uploadImage(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) { setImageUrl(data.url); setImageUrls([...imageUrls, data.url]); }
    else alert(data.error || '上传失败');
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get('name') as string,
      category: fd.get('category') as Category,
      price: Number(fd.get('price')),
      description: (fd.get('description') as string) || '',
      images: imageUrls.length > 0 ? imageUrls : [imageUrl || '/placeholder.svg'],
      stock: Number(fd.get('stock')) || 0,
    };

    if (editing) {
      await fetch(`/api/products/${editing.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
    } else {
      await fetch('/api/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
      });
    }
    e.currentTarget.reset();
    setImageUrl('');
    setEditing(null);
    setShowForm(false);
    fetchProducts();
  }

  return (
    <>
      <div className="meadow-panel mb-4 flex items-center justify-between rounded-[24px] p-4 text-white">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#f4ddc8]">WORKS</p>
          <h2 className="mt-1 text-lg font-semibold">
            产品列表（{products.length}件{products.filter(p => p.featured).length > 0 ? `，${products.filter(p => p.featured).length}件精选` : ''}）
          </h2>
        </div>
        <button
          onClick={() => { setEditing(null); setImageUrl(''); setShowForm(true); }}
          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#263325] shadow-sm transition-transform hover:-translate-y-0.5"
        >
          添加产品
        </button>
      </div>

      {showForm && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => { setShowForm(false); setEditing(null); setImageUrl(''); }} />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-[#f4efe6] shadow-2xl">
            <div className="sticky top-0 z-10 border-b border-[#dfd0bb] bg-[#f4efe6]/92 px-6 py-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#2c251f]">{editing ? '编辑产品' : '添加产品'}</h3>
                <button type="button" onClick={() => { setShowForm(false); setEditing(null); setImageUrl(''); }} className="rounded-full border border-[#dfd0bb] bg-white px-3 py-1 text-xl leading-none text-[#8a7a6a] hover:bg-white">&times;</button>
              </div>
            </div>
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#6f6257]">产品名称 *</label>
                <input name="name" required defaultValue={editing?.name || ''} className="w-full rounded-2xl border border-[#ded0bd] bg-[#fffaf4] px-4 py-2.5 text-sm outline-none focus:border-[#9a6d64]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#6f6257]">分类 *</label>
                <select name="category" required defaultValue={editing?.category || '书签'} className="w-full rounded-2xl border border-[#ded0bd] bg-[#fffaf4] px-4 py-2.5 text-sm outline-none focus:border-[#9a6d64]">
                  {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-[#6f6257]">价格 (¥) *</label>
                <input name="price" type="number" required min="0" step="0.01" defaultValue={editing?.price || ''} className="w-full rounded-2xl border border-[#ded0bd] bg-[#fffaf4] px-4 py-2.5 text-sm outline-none focus:border-[#9a6d64]" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-[#6f6257]">库存数量</label>
                <input name="stock" type="number" min="0" defaultValue={editing?.stock ?? 0} className="w-full rounded-2xl border border-[#ded0bd] bg-[#fffaf4] px-4 py-2.5 text-sm outline-none focus:border-[#9a6d64]" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#6f6257]">产品图片（可添加多张）</label>
              {/* 已添加的图片 */}
              {imageUrls.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-2">
                  {imageUrls.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt={`图${i + 1}`} className="h-16 w-16 rounded-xl object-cover" />
                      <button
                        type="button"
                        onClick={() => setImageUrls(imageUrls.filter((_, j) => j !== i))}
                        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-400 text-xs text-white"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
              {/* 上传区域 */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) uploadImage(f); }}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-[22px] border-2 border-dashed p-4 text-center transition-colors ${dragOver ? 'border-[#b85c62] bg-white/82' : 'border-white/52 bg-white/48'} ${uploading ? 'pointer-events-none opacity-50' : ''}`}
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} className="hidden" />
                {uploading ? (<div className="text-[#8a7a6a]"><p className="text-lg">⏳</p><p className="text-sm">上传中...</p></div>)
                : (<div className="text-[#8a7a6a]"><p className="mb-1 text-xl">📷</p><p className="text-xs">点击或拖拽上传图片</p><p className="mt-1 text-[10px]">JPG/PNG/WebP，最大10MB</p></div>)}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="shrink-0 text-xs text-[#a29486]">或链接：</span>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && imageUrl.trim()) {
                      e.preventDefault();
                      setImageUrls([...imageUrls, imageUrl.trim()]);
                      setImageUrl('');
                    }
                  }}
                  className="flex-1 rounded-xl border border-[#ded0bd] bg-[#fffaf4] px-3 py-2 text-xs outline-none focus:border-[#9a6d64]" placeholder="粘贴图片链接后按回车添加"
                />
              </div>

              <div className="mt-2">
                <button type="button" onClick={() => { setShowGallery(!showGallery); loadGallery(); }} className="text-xs text-[#8a7a6a] hover:text-[#b85c62]">
                  {showGallery ? '收起' : '📁 选择已上传的图片'}
                </button>
                {showGallery && (
                  <div className="mt-2 grid max-h-40 grid-cols-4 gap-2 overflow-y-auto">
                    {gallery.map((img) => (
                      <button
                        key={img}
                        type="button"
                        onClick={() => { setImageUrls([...imageUrls, img]); setShowGallery(false); }}
                        className={`aspect-square overflow-hidden rounded-xl border-2 ${imageUrls.includes(img) ? 'border-[#b85c62]' : 'border-[#dfd0bd]'}`}
                      >
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                    {gallery.length === 0 && (
                      <p className="col-span-4 py-2 text-xs text-[#a29486]">还没有上传过图片</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-[#6f6257]">描述</label>
              <textarea name="description" defaultValue={editing?.description || ''} rows={2} className="w-full rounded-2xl border border-[#ded0bd] bg-[#fffaf4] px-4 py-2.5 text-sm outline-none focus:border-[#9a6d64]" />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 rounded-full bg-[#251f1a] py-2 font-semibold text-white">{editing ? '保存修改' : '添加'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setImageUrl(''); }} className="rounded-full border border-[#dfd0bd] px-6 py-2 text-[#6f6257]">取消</button>
            </div>
          </form>
          </div>
        </>
      )}

      <div className="pressed-paper overflow-x-auto rounded-[28px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#dfe9d8] bg-white/58 text-[#5e6b55]">
              <th className="px-4 py-3 text-center">精选</th>
              <th className="px-4 py-3 text-left">图片</th>
              <th className="px-4 py-3 text-left">产品</th>
              <th className="px-4 py-3 text-left">分类</th>
              <th className="px-4 py-3 text-right">价格</th>
              <th className="px-4 py-3 text-center">库存</th>
              <th className="px-4 py-3 text-center">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={`border-b border-[#e1eadc] last:border-0 hover:bg-white/50 ${p.stock === 0 ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => handleToggleFeatured(p)}
                    title={p.featured ? '取消精选' : '设为精选'}
                    className="text-lg transition-colors"
                  >
                    {p.featured ? '⭐' : '☆'}
                  </button>
                </td>
                <td className="px-4 py-3"><img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded-lg object-cover" /></td>
                <td className="px-4 py-3 font-medium text-[#2f271f]">{p.name}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-[#f6ebe5] px-2 py-0.5 text-xs text-[#b85c62]">{p.category}</span></td>
                <td className="px-4 py-3 text-right font-medium text-[#2f271f]">¥{p.price}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => handleStockChange(p, -1)} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d7c4ac] text-xs text-[#66594f] hover:bg-white">−</button>
                    <span className={`w-8 text-center text-sm font-medium ${p.stock === 0 ? 'text-[#b85c62]' : p.stock < 5 ? 'text-[#d97d53]' : 'text-[#2f271f]'}`}>{p.stock}</span>
                    <button onClick={() => handleStockChange(p, 1)} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#d7c4ac] text-xs text-[#66594f] hover:bg-white">+</button>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleDuplicate(p)} className="mr-2 text-[#4b7a59] hover:text-[#376147]">复制</button>
                  <button onClick={() => { setEditing(p); setImageUrls(p.images || []); setImageUrl(''); setShowForm(true); }} className="mr-2 text-[#4d77a8] hover:text-[#315e8b]">编辑</button>
                  <button onClick={() => handleDelete(p.id)} className="text-[#b85c62] hover:text-[#8f4046]">删除</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (<tr><td colSpan={7} className="py-8 text-center text-[#a29486]">暂无产品</td></tr>)}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ════════════════════════════════════════
// ORDER MANAGER — 查看订单 & 导出地址 CSV
// ════════════════════════════════════════
function OrderManager() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => { fetchOrders(); }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', { cache: 'no-store' });
      const data = await res.json();
      setOrders(Array.isArray(data) ? data.reverse() : []);
    } catch { setOrders([]); }
    setLoading(false);
  }

  // 按日期筛选
  const filteredOrders = orders.filter((o) => {
    const orderDate = new Date(o.createdAt).toISOString().slice(0, 10);
    if (dateFrom && orderDate < dateFrom) return false;
    if (dateTo && orderDate > dateTo) return false;
    return true;
  });

  // 今日快捷筛选
  function filterToday() {
    const today = new Date().toISOString().slice(0, 10);
    setDateFrom(today);
    setDateTo(today);
  }

  function clearFilter() {
    setDateFrom('');
    setDateTo('');
  }

  function exportCSV() {
    const list = filteredOrders.length > 0 ? filteredOrders : orders;
    const dateLabel = dateFrom ? `${dateFrom}至${dateTo || '今天'}` : '全部';
    const header = '序号,订单号,下单时间,收件人,手机号,地址,商品,金额,备注,状态\n';
    const rows = list.map((o, i) => {
      const items = o.items?.map((it: any) => `${it.product?.name || '?'}×${it.quantity}`).join('; ') || '';
      return [
        i + 1, o.id, new Date(o.createdAt).toLocaleString('zh-CN'),
        o.customer?.name || '', o.customer?.phone || '', o.customer?.address || '',
        items, o.total, o.customer?.note || '',
        o.status === 'paid' ? '已付款' : o.status === 'shipped' ? '已发货' : '待付款',
      ].join(',');
    }).join('\n');

    const BOM = '﻿';
    const blob = new Blob([BOM + header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `订单地址_${dateLabel}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function toggleStatus(order: any) {
    const next = order.status === 'pending' ? 'paid' : order.status === 'paid' ? 'shipped' : 'pending';
    await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: order.id, status: next }),
    });
    fetchOrders();
  }

  const statusLabel = (s: string) => s === 'paid' ? '已付款' : s === 'shipped' ? '已发货' : '待付款';

  return (
    <>
      <div className="meadow-panel mb-4 flex flex-col gap-3 rounded-[24px] p-4 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-[#f4ddc8]">ORDERS</p>
          <h2 className="mt-1 text-lg font-semibold">订单记录（{filteredOrders.length}条{dateFrom ? '，已筛选' : ''}）</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={filterToday} className="rounded-full border border-white/40 bg-white/14 px-3 py-1.5 text-xs text-white backdrop-blur hover:bg-white/24">今天</button>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-xl border border-white/40 bg-white/18 px-2 py-1.5 text-xs text-white backdrop-blur [color-scheme:dark]" title="开始日期" />
          <span className="text-xs text-white/60">至</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-xl border border-white/40 bg-white/18 px-2 py-1.5 text-xs text-white backdrop-blur [color-scheme:dark]" title="结束日期" />
          {(dateFrom || dateTo) && (
            <button onClick={clearFilter} className="rounded-full border border-white/40 bg-white/14 px-2 py-1.5 text-xs text-white/70 backdrop-blur hover:bg-white/24">清除</button>
          )}
          <button onClick={exportCSV} disabled={orders.length === 0} className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#263325] shadow-sm transition-transform hover:-translate-y-0.5 disabled:opacity-40">
            ⬇ 导出 CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center text-[#8d8176]">加载中...</div>
      ) : orders.length === 0 ? (
        <div className="pressed-paper rounded-3xl px-6 py-16 text-center"><p className="text-[#8d8176]">还没有订单</p></div>
      ) : filteredOrders.length === 0 ? (
        <div className="pressed-paper rounded-3xl px-6 py-16 text-center"><p className="text-[#8d8176]">该日期范围内无订单</p><button onClick={clearFilter} className="mt-2 text-sm text-[#4b7a59] hover:underline">清除筛选</button></div>
      ) : (
        <div className="pressed-paper overflow-x-auto rounded-[28px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#dfe9d8] bg-white/58 text-[#5e6b55]">
                <th className="px-4 py-3 text-left">收件人</th>
                <th className="px-4 py-3 text-left">手机号</th>
                <th className="px-4 py-3 text-left">地址</th>
                <th className="px-4 py-3 text-left">商品</th>
                <th className="px-4 py-3 text-right">金额</th>
                <th className="px-4 py-3 text-center">状态</th>
                <th className="px-4 py-3 text-center">时间</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id} className="border-b border-[#e1eadc] last:border-0 hover:bg-white/50">
                  <td className="px-4 py-3 font-medium text-[#2f271f]">{o.customer?.name}</td>
                  <td className="px-4 py-3 text-[#6d6156]">{o.customer?.phone}</td>
                  <td className="max-w-[14rem] truncate px-4 py-3 text-[#6d6156]" title={o.customer?.address}>{o.customer?.address}</td>
                  <td className="px-4 py-3 text-[#6d6156]">{o.items?.map((it: any) => `${it.product?.name}×${it.quantity}`).join(', ')}</td>
                  <td className="px-4 py-3 text-right font-medium text-[#2f271f]">¥{o.total}</td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => toggleStatus(o)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        o.status === 'paid' ? 'bg-[#dfe9d8] text-[#3d5a31]' :
                        o.status === 'shipped' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {statusLabel(o.status)}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-[#a29486]">{new Date(o.createdAt).toLocaleDateString('zh-CN')}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#dfe9d8] bg-[#f6f3ed] font-medium">
                <td className="px-4 py-3 text-[#2f271f]">合计</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-[#2f271f]">{filteredOrders.length} 单</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-right text-[#2f271f]">¥{filteredOrders.reduce((s, o) => s + Number(o.total), 0)}</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </>
  );
}
