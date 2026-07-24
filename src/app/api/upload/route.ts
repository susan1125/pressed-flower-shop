import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return Response.json({ error: '没有上传文件' }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: '图片不能超过10MB' }, { status: 400 });
  }

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
    } catch {
      await writeFile(filepath, buffer);
    }
  } else {
    await writeFile(filepath, buffer);
  }

  return Response.json({ url: `/uploads/${filename}`, name: file.name });
}
