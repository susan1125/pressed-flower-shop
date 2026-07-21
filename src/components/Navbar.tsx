'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      setIsAdmin(localStorage.getItem('admin_auth') === 'true');
    };
    handleStorage();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/35 bg-[#f4efe6]/76 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#31523a] text-base font-semibold text-white shadow-sm">
            沁
          </span>
          <span className="text-lg font-semibold tracking-wide text-[#263325]">沁瓣</span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/"
            className="rounded-full px-4 py-2 text-sm font-medium text-[#4e5a48] transition-colors hover:bg-white/72 hover:text-[#263325]"
          >
            作品展示
          </Link>
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-full border border-white/45 bg-white/52 px-4 py-2 text-sm font-medium text-[#5b684f] transition-colors hover:bg-white/82 hover:text-[#263325]"
            >
              管理
            </Link>
          )}
        </div>

        <button
          className="md:hidden rounded-full border border-white/45 bg-white/70 p-2 text-[#314233]"
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
        <div className="border-t border-white/40 bg-[#f4efe6]/92 px-4 py-3 backdrop-blur-xl md:hidden">
          <Link href="/" className="block rounded-md px-3 py-2 text-[#4f4338]" onClick={() => setMenuOpen(false)}>
            作品展示
          </Link>
          {isAdmin && (
            <Link href="/admin" className="mt-1 block rounded-md px-3 py-2 text-[#8a7a6a]" onClick={() => setMenuOpen(false)}>
              管理后台
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
