'use client';

import { Category, CATEGORIES } from '@/types';

interface Props {
  active: Category | '全部';
  onChange: (cat: Category | '全部') => void;
}

export default function CategoryFilter({ active, onChange }: Props) {
  return (
    <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
      <button
        type="button"
        onClick={() => onChange('全部')}
        className={`flower-pill shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          active === '全部'
            ? 'bg-[#251f1a] text-white'
            : 'text-[#65584d] hover:bg-white'
        }`}
      >
        全部
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onChange(cat)}
          className={`flower-pill shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            active === cat
              ? 'bg-[#3f5f47] text-white'
              : 'text-[#65584d] hover:bg-white'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
