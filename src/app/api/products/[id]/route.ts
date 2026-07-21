import { NextRequest } from 'next/server';
import { getProduct, updateProduct, deleteProduct } from '@/lib/products';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) {
    return Response.json({ error: 'Product not found' }, { status: 404 });
  }
  return Response.json(product);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updated = updateProduct(id, body);
  if (!updated) {
    return Response.json({ error: 'Product not found' }, { status: 404 });
  }
  return Response.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = deleteProduct(id);
  if (!deleted) {
    return Response.json({ error: 'Product not found' }, { status: 404 });
  }
  return Response.json({ success: true });
}
