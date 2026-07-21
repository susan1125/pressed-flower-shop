'use client';

import { Category, CATEGORIES } from '@/types';

interface Props {
  active: Category | '全部';
  onChange: (cat: Category | '全部') => void;
}

export default function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      <button
        onClick={() => onChange('全部')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          active === '全部'
            ? 'bg-rose-500 text-white'
            : 'bg-white text-gray-600 hover:bg-rose-50'
        }`}
      >
        全部
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            active === cat
              ? 'bg-rose-500 text-white'
              : 'bg-white text-gray-600 hover:bg-rose-50'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
