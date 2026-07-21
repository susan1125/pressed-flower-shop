import { readdirSync } from 'fs';
import path from 'path';

export async function GET() {
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
