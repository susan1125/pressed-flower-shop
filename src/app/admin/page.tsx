'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Product, Category, CATEGORIES } from '@/types';

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('admin_auth') === 'true';
  });
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (password === 'yahua2026') {
      setLoggedIn(true);
      localStorage.setItem('admin_auth', 'true');
    } else {
      alert('密码错误');
    }
  };

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20">
        <div className="pressed-paper rounded-[28px] p-6">
          <h1 className="text-center text-2xl font-semibold text-[#2c251f]">管理后台</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            className="mt-6 w-full rounded-2xl border border-[#ded0bd] bg-[#fffaf4] px-4 py-3 text-sm outline-none focus:border-[#9a6d64]"
            placeholder="请输入管理密码"
          />
          <button
            onClick={handleLogin}
            className="mt-3 w-full rounded-full bg-[#251f1a] py-3 font-semibold text-white"
          >
            登录
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-[#2c251f]">产品管理</h1>
          <Link href="/" className="rounded-full border border-[#dcc9b1] bg-white/70 px-3 py-1 text-xs text-[#8a7a6a]">
            ← 回到店铺
          </Link>
        </div>
        <button
          onClick={() => { localStorage.removeItem('admin_auth'); setLoggedIn(false); }}
          className="text-sm text-[#8a7a6a] hover:text-[#b85c62]"
        >
          退出
        </button>
      </div>

      <ProductManager />
    </div>
  );
}

function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
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

  async function uploadImage(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    if (data.url) setImageUrl(data.url);
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
      images: [imageUrl || '/placeholder.svg'],
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
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#2f271f]">产品列表（{products.length}件）</h2>
        <button
          onClick={() => { setEditing(null); setImageUrl(''); setShowForm(true); }}
          className="rounded-full bg-[#251f1a] px-4 py-2 text-sm font-semibold text-white"
        >
          + 添加产品
        </button>
      </div>

      {showForm && (
        <div className="pressed-paper mb-6 rounded-[28px] p-6">
          <h3 className="mb-4 text-lg font-semibold text-[#2c251f]">{editing ? '编辑产品' : '添加产品'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="mb-1 block text-sm font-medium text-[#6f6257]">产品图片</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) uploadImage(f); }}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-[22px] border-2 border-dashed p-6 text-center transition-colors ${dragOver ? 'border-[#b85c62] bg-[#faf0ec]' : 'border-[#d7c4ac] bg-[#fffaf4]'} ${uploading ? 'pointer-events-none opacity-50' : ''}`}
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} className="hidden" />
                {uploading ? (<div className="text-[#8a7a6a]"><p className="text-lg">⏳</p><p className="text-sm">上传中...</p></div>)
                : imageUrl ? (<div><img src={imageUrl} alt="预览" className="mx-auto h-32 w-32 rounded-2xl object-cover shadow-sm" /><p className="mt-1 text-xs text-[#8a7a6a]">点击或拖拽更换</p></div>)
                : (<div className="text-[#8a7a6a]"><p className="mb-1 text-2xl">📷</p><p className="text-sm">点击或拖拽上传图片</p><p className="mt-1 text-xs">JPG/PNG/WebP，最大10MB</p></div>)}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-[#a29486]">或链接：</span>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="flex-1 rounded-xl border border-[#ded0bd] bg-[#fffaf4] px-3 py-2 text-xs outline-none focus:border-[#9a6d64]" placeholder="https://..." />
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
                        onClick={() => { setImageUrl(img); setShowGallery(false); }}
                        className={`aspect-square overflow-hidden rounded-xl border-2 ${imageUrl === img ? 'border-[#b85c62]' : 'border-[#dfd0bd]'}`}
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
      )}

      <div className="pressed-paper overflow-hidden rounded-[28px]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#eadbc8] bg-white/50 text-[#8a7a6a]">
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
              <tr key={p.id} className={`border-b border-[#efe2d0] last:border-0 hover:bg-white/50 ${p.stock === 0 ? 'opacity-50' : ''}`}>
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
                  <button onClick={() => { setEditing(p); setImageUrl(p.images[0] || ''); setShowForm(true); }} className="mr-2 text-[#4d77a8] hover:text-[#315e8b]">编辑</button>
                  <button onClick={() => handleDelete(p.id)} className="text-[#b85c62] hover:text-[#8f4046]">删除</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (<tr><td colSpan={6} className="py-8 text-center text-[#a29486]">暂无产品</td></tr>)}
          </tbody>
        </table>
      </div>
    </>
  );
}
