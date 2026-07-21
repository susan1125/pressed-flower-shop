import { NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { storageRead, storageWrite } from '@/lib/storage';

const execAsync = promisify(exec);
const IS_VERCEL = !!(process.env.BLOB_READ_WRITE_TOKEN);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return Response.json({ error: '没有上传文件' }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: '图片不能超过10MB' }, { status: 400 });
  }

  // ── Vercel 生产环境：用 Blob Storage ──
  if (IS_VERCEL) {
    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const blob = await put(filename, file, { access: 'public' });
      // 记录到 KV
      const images = await storageRead<string[]>('uploads', []);
      images.push(blob.url);
      await storageWrite('uploads', images);
      return Response.json({ url: blob.url, name: file.name });
    } catch (err: any) {
      return Response.json({ error: err.message || '上传失败' }, { status: 500 });
    }
  }

  // ── 本地：写文件到 public/uploads ──
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadsDir, { recursive: true });

  const inputExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const filename = `${baseName}.jpg`;
  const filepath = path.join(uploadsDir, filename);

  if (inputExt === 'heic' || inputExt === 'heif') {
    const tempPath = path.join(uploadsDir, `${baseName}_temp.${inputExt}`);
    await writeFile(tempPath, buffer);
    try {
      await execAsync(`sips -s format jpeg "${tempPath}" --out "${filepath}"`);
      // 不删 temp，忽略
    } catch {
      await writeFile(filepath, buffer);
    }
  } else {
    await writeFile(filepath, buffer);
  }

  return Response.json({ url: `/api/uploads/${filename}`, name: file.name });
}
