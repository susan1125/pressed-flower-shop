/**
 * 数据存储适配器
 * - Vercel 部署：用 @vercel/kv 持久化
 * - 本地开发：用 data/*.json 文件
 */
import { kv } from '@vercel/kv';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

// ── 判断是否在 Vercel 生产环境 ──
const IS_VERCEL = !!(
  process.env.KV_URL && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

const DATA_DIR = path.join(process.cwd(), 'data');

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

// ── 通用读写 ──

export async function storageRead<T>(key: string, fallback: T): Promise<T> {
  if (IS_VERCEL) {
    try {
      const data = await kv.get<T>(key);
      if (data !== null && data !== undefined) return data;
    } catch {}
  }
  // fallback: 读本地文件
  ensureDir();
  const file = path.join(DATA_DIR, `${key}.json`);
  if (existsSync(file)) {
    try {
      return JSON.parse(readFileSync(file, 'utf-8')) as T;
    } catch {}
  }
  return fallback;
}

export async function storageWrite<T>(key: string, data: T): Promise<void> {
  if (IS_VERCEL) {
    try {
      await kv.set(key, data as any);
      return;
    } catch {}
  }
  // fallback: 写本地文件
  ensureDir();
  const file = path.join(DATA_DIR, `${key}.json`);
  writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}
