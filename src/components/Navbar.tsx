'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('admin_auth') === 'true');
    const handleStorage = () => {
      setIsAdmin(localStorage.getItem('admin_auth') === 'true');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-rose-600 tracking-wide">
          🌸 压花小铺
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-700 hover:text-rose-600 transition-colors">
            作品展示
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="text-gray-400 hover:text-rose-600 transition-colors text-sm border border-gray-200 px-3 py-1 rounded-full"
            >
              ⚙️ 管理
            </Link>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-3">
          <Link href="/" className="block text-gray-700" onClick={() => setMenuOpen(false)}>
            作品展示
          </Link>
          {isAdmin && (
            <Link href="/admin" className="block text-gray-400" onClick={() => setMenuOpen(false)}>
              ⚙️ 管理后台
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
