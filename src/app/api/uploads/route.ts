import { readdirSync } from 'fs';
import path from 'path';
import { storageRead } from '@/lib/storage';

const IS_VERCEL = !!(process.env.KV_URL && process.env.KV_REST_API_URL);

export async function GET() {
  if (IS_VERCEL) {
    // Vercel: 从 KV 读取上传记录
    const images = await storageRead<string[]>('uploads', []);
    return Response.json(images);
  }

  // 本地: 读 public/uploads 目录
  const dir = path.join(process.cwd(), 'public', 'uploads');
  const images: string[] = [];
  try {
    const files = readdirSync(dir);
    for (const f of files) {
      if (/\.(jpg|jpeg|png|webp|gif)$/i.test(f)) {
        images.push(`/api/uploads/${f}`);
      }
    }
  } catch {}
  return Response.json(images);
}
