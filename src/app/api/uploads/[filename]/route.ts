import { NextRequest } from 'next/server';
import { readFileSync } from 'fs';
import path from 'path';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Prevent path traversal
  if (filename.includes('..') || filename.includes('/')) {
    return new Response('Not found', { status: 404 });
  }

  const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

  try {
    const buffer = readFileSync(filepath);
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      gif: 'image/gif',
      svg: 'image/svg+xml',
    };
    const contentType = mimeTypes[ext || ''] || 'image/jpeg';

    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
