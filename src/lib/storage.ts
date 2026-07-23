/**
 * 数据存储适配器
 * - Vercel 部署：用 Upstash Redis
 * - 本地开发：用 data/*.json 文件，永不覆盖
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const IS_REDIS = !!(REDIS_URL && REDIS_TOKEN);

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

async function redisFetch(cmd: string): Promise<any> {
  const url = `${REDIS_URL}/${cmd}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${REDIS_TOKEN}` } });
  if (!res.ok) throw new Error(`Redis error: ${res.status}`);
  const data = await res.json();
  return data.result;
}

export async function storageRead<T>(key: string, fallback: T): Promise<T> {
  if (IS_REDIS) {
    try {
      const raw = await redisFetch(`GET/${key}`);
      if (raw) return JSON.parse(raw) as T;
    } catch {}
  }
  ensureDir();
  const file = path.join(DATA_DIR, `${key}.json`);
  if (existsSync(file)) {
    try {
      const data = JSON.parse(readFileSync(file, 'utf-8')) as T;
      // 确保不为空数组（首次初始化除外）
      if (Array.isArray(data)) return data as T;
    } catch {}
  }
  // 只有文件不存在时才用 fallback，然后立刻写出
  if (!existsSync(file) && fallback) {
    try {
      writeFileSync(file, JSON.stringify(fallback, null, 2), 'utf-8');
    } catch {}
  }
  return fallback;
}

export async function storageWrite<T>(key: string, data: T): Promise<void> {
  if (IS_REDIS) {
    try {
      await redisFetch(`SET/${key}/${encodeURIComponent(JSON.stringify(data))}`);
      return;
    } catch {}
  }
  ensureDir();
  const file = path.join(DATA_DIR, `${key}.json`);
  writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

export function isVercelBlob(): boolean {
  return !!(process.env.BLOB_READ_WRITE_TOKEN);
}
