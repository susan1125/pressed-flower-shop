/**
 * 数据存储适配器
 * - Vercel 部署：用 Upstash Redis（通过 REST API）
 * - 本地开发：用 data/*.json 文件
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Upstash Redis 配置（Vercel 集成会自动注入这些环境变量）
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const IS_REDIS = !!(REDIS_URL && REDIS_TOKEN);

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

async function redisFetch(cmd: string): Promise<any> {
  const url = `${REDIS_URL}/${cmd}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` },
  });
  if (!res.ok) throw new Error(`Redis error: ${res.status}`);
  const data = await res.json();
  return data.result;
}

// ── 通用读写 ──

export async function storageRead<T>(key: string, fallback: T): Promise<T> {
  if (IS_REDIS) {
    try {
      const raw = await redisFetch(`GET/${key}`);
      if (raw) return JSON.parse(raw) as T;
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
  if (IS_REDIS) {
    try {
      await redisFetch(`SET/${key}/${encodeURIComponent(JSON.stringify(data))}`);
      return;
    } catch {}
  }
  // fallback: 写本地文件
  ensureDir();
  const file = path.join(DATA_DIR, `${key}.json`);
  writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

// ── Blob 图片存储（用于上传API判断） ──
export function isVercelBlob(): boolean {
  return !!(process.env.BLOB_READ_WRITE_TOKEN);
}
