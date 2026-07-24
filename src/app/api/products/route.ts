import { NextRequest } from 'next/server';
import { getProducts, addProduct, getAllProducts } from '@/lib/products';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  if (searchParams.get('admin') === 'true') {
    return Response.json(await getAllProducts());
  }

  const category = searchParams.get('category');
  const all = await getProducts(category || undefined);

  // 分页：默认 12 条
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const pageSize = Math.min(100, Math.max(4, parseInt(searchParams.get('pageSize') || '12')));

  const start = (page - 1) * pageSize;
  const items = all.slice(start, start + pageSize);

  return Response.json({
    items,
    total: all.length,
    page,
    pageSize,
    hasMore: start + pageSize < all.length,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const product = await addProduct(body);
  return Response.json(product, { status: 201 });
}
