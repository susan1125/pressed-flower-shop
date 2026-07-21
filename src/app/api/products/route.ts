import { NextRequest } from 'next/server';
import { getProducts, addProduct, getAllProducts } from '@/lib/products';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category');

  if (searchParams.get('admin') === 'true') {
    return Response.json(await getAllProducts());
  }

  const products = await getProducts(category || undefined);
  return Response.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const product = await addProduct(body);
  return Response.json(product, { status: 201 });
}
