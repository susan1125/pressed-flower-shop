'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('admin_auth') === 'true';
  });

  useEffect(() => {
    const handleStorage = () => {
      setIsAdmin(localStorage.getItem('admin_auth') === 'true');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#cbc0b2] bg-[#f5f0e9]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#8a9c84] text-base text-white shadow-sm">
            花
          </span>
          <span className="text-lg font-semibold tracking-wide text-[#3d362e]">压花小铺</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm font-medium text-[#6d6156] transition-colors hover:bg-white hover:text-[#3d362e]"
          >
            作品展示
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-full border border-[#cbc0b2] bg-white/60 px-4 py-2 text-sm font-medium text-[#8a7d6e] transition-colors hover:bg-white hover:text-[#3d362e]"
            >
              管理
            </Link>
          )}
        </div>

        <button
          className="md:hidden rounded-full border border-[#cbc0b2] bg-white/70 p-2 text-[#5c5046]"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
          aria-expanded={menuOpen}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-[#cbc0b2] bg-[#f5f0e9] px-4 py-3 md:hidden">
          <Link href="/" className="block rounded-md px-3 py-2 text-[#5c5046]" onClick={() => setMenuOpen(false)}>
            作品展示
          </Link>
          {isAdmin && (
            <Link href="/admin" className="mt-1 block rounded-md px-3 py-2 text-[#8a7d6e]" onClick={() => setMenuOpen(false)}>
              管理后台
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
