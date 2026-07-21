'use client';

import { useState, useEffect, useRef } from 'react';
import { Product, Category, CATEGORIES } from '@/types';

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [password, setPassword] = useState('');

  // ── Auth ──
  const handleLogin = () => {
    if (password === 'yahua2026') {
      setLoggedIn(true);
      localStorage.setItem('admin_auth', 'true');
    } else {
      alert('密码错误');
    }
  };

  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') setLoggedIn(true);
  }, []);

  if (!loggedIn) {
    return (
      <div className="max-w-sm mx-auto px-4 py-20">
        <h1 className="text-2xl font-bold text-center mb-6">🔐 管理后台</h1>
        <input
          type="password" value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rose-300 mb-3"
          placeholder="请输入管理密码"
        />
        <button onClick={handleLogin} className="w-full bg-rose-500 text-white py-3 rounded-xl font-medium hover:bg-rose-600">
          登录
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* ── Header + Tabs ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">📋 管理后台</h1>
          <a href="/" className="text-xs text-gray-400 hover:text-rose-500 border border-gray-200 px-3 py-1 rounded-full">
            ← 回到店铺
          </a>
        </div>
        <button
          onClick={() => { localStorage.removeItem('admin_auth'); setLoggedIn(false); }}
          className="text-gray-400 text-sm hover:text-gray-600"
        >
          退出
        </button>
      </div>

      {/* Tabs */}
      <ProductManager />
    </div>
  );
}

// ════════════════════════════════════════
// PRODUCT MANAGER
// ════════════════════════════════════════
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
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-700">产品列表（{products.length}件）</h2>
        <button
          onClick={() => { setEditing(null); setImageUrl(''); setShowForm(true); }}
          className="bg-rose-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-rose-600"
        >
          + 添加产品
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">{editing ? '编辑产品' : '添加产品'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">产品名称 *</label>
                <input name="name" required defaultValue={editing?.name || ''} className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-300" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">分类 *</label>
                <select name="category" required defaultValue={editing?.category || '书签'} className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-300">
                  {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">价格 (¥) *</label>
                <input name="price" type="number" required min="0" step="0.01" defaultValue={editing?.price || ''} className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-300" />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">库存数量</label>
                <input name="stock" type="number" min="0" defaultValue={editing?.stock ?? 0} className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-300" />
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className="block text-sm text-gray-500 mb-1">产品图片</label>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) uploadImage(f); }}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-rose-400 bg-rose-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'} ${uploading ? 'pointer-events-none opacity-50' : ''}`}
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); }} className="hidden" />
                {uploading ? (<div className="text-gray-400"><p className="text-lg">⏳</p><p className="text-sm">上传中...</p></div>)
                : imageUrl ? (<div><img src={imageUrl} alt="预览" className="w-32 h-32 object-cover rounded-xl mx-auto shadow-sm" /><p className="text-xs text-gray-400 mt-1">点击或拖拽更换</p></div>)
                : (<div className="text-gray-400"><p className="text-2xl mb-1">📷</p><p className="text-sm">点击或拖拽上传图片</p><p className="text-xs mt-1 text-gray-300">JPG/PNG/WebP，最大10MB</p></div>)}
              </div>
              <div className="mt-2 flex gap-2 items-center">
                <span className="text-xs text-gray-300">或链接：</span>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="flex-1 border rounded-lg px-3 py-1 text-xs focus:outline-none focus:border-rose-300" placeholder="https://..." />
              </div>

              {/* Existing images gallery */}
              <div className="mt-2">
                <button type="button" onClick={() => { setShowGallery(!showGallery); loadGallery(); }} className="text-xs text-gray-400 hover:text-rose-500">
                  {showGallery ? '收起' : '📁 选择已上传的图片'}
                </button>
                {showGallery && (
                  <div className="mt-2 grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                    {gallery.map((img) => (
                      <button
                        key={img}
                        type="button"
                        onClick={() => { setImageUrl(img); setShowGallery(false); }}
                        className={`aspect-square rounded-lg overflow-hidden border-2 ${imageUrl === img ? 'border-rose-500' : 'border-gray-200 hover:border-gray-400'}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                    {gallery.length === 0 && (
                      <p className="col-span-4 text-xs text-gray-400 py-2">还没有上传过图片</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">描述</label>
              <textarea name="description" defaultValue={editing?.description || ''} rows={2} className="w-full border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-300" />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-rose-500 text-white py-2 rounded-full font-medium hover:bg-rose-600">{editing ? '保存修改' : '添加'}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); setImageUrl(''); }} className="px-6 py-2 rounded-full border text-gray-500 hover:bg-gray-50">取消</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-gray-50 text-gray-500"><th className="text-left px-4 py-3">图片</th><th className="text-left px-4 py-3">产品</th><th className="text-left px-4 py-3">分类</th><th className="text-right px-4 py-3">价格</th><th className="text-center px-4 py-3">库存</th><th className="text-center px-4 py-3">操作</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={`border-b last:border-0 hover:bg-gray-50 ${p.stock === 0 ? 'opacity-50' : ''}`}>
                <td className="px-4 py-3"><img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-lg" /></td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3"><span className="text-xs bg-rose-50 text-rose-500 px-2 py-0.5 rounded-full">{p.category}</span></td>
                <td className="px-4 py-3 text-right font-medium">¥{p.price}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => handleStockChange(p, -1)} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 text-xs hover:bg-gray-100">−</button>
                    <span className={`w-8 text-center text-sm font-medium ${p.stock === 0 ? 'text-red-500' : p.stock < 5 ? 'text-orange-500' : 'text-gray-700'}`}>{p.stock}</span>
                    <button onClick={() => handleStockChange(p, 1)} className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 text-xs hover:bg-gray-100">+</button>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => handleDuplicate(p)} className="text-green-500 hover:text-green-700 mr-2">复制</button>
                  <button onClick={() => { setEditing(p); setImageUrl(p.images[0] || ''); setShowForm(true); }} className="text-blue-500 hover:text-blue-700 mr-2">编辑</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-600">删除</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (<tr><td colSpan={6} className="text-center py-8 text-gray-400">暂无产品</td></tr>)}
          </tbody>
        </table>
      </div>
    </>
  );
}


