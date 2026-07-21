import { NextRequest } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
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

  // Always save as .jpg (browser-compatible format)
  const inputExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const filename = `${baseName}.jpg`;
  const filepath = path.join(uploadsDir, filename);

  // HEIC/HEIF from iPhone → convert to JPEG using macOS sips
  if (inputExt === 'heic' || inputExt === 'heif') {
    const tempPath = path.join(uploadsDir, `${baseName}_temp.${inputExt}`);
    await writeFile(tempPath, buffer);

    try {
      await execAsync(`sips -s format jpeg "${tempPath}" --out "${filepath}"`);
      await unlink(tempPath).catch(() => {});
    } catch {
      // Fallback: just save the file but with .jpg extension
      // (won't display in browser but at least won't lose the upload)
      await writeFile(filepath, buffer);
      await unlink(tempPath).catch(() => {});
    }
  } else {
    // For other formats (png, webp, jpg), just save directly
    await writeFile(filepath, buffer);
  }

  return Response.json({ url: `/api/uploads/${filename}`, name: file.name });
}
