import { NextRequest } from 'next/server';
import { storageRead, storageWrite } from '@/lib/storage';

const KEY = 'orders';

interface Order {
  id: string;
  items: any[];
  total: number;
  customer: any;
  status: string;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const order: Order = { id: Date.now().toString(), ...body, createdAt: new Date().toISOString() };
  const orders = await storageRead<Order[]>(KEY, []);
  orders.push(order);
  await storageWrite(KEY, orders);
  return Response.json(order, { status: 201 });
}

export async function GET() {
  const orders = await storageRead<Order[]>(KEY, []);
  return Response.json(orders);
}

export async function PUT(request: NextRequest) {
  const { id, status } = await request.json();
  const orders = await storageRead<Order[]>(KEY, []);
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) return Response.json({ error: 'Not found' }, { status: 404 });
  orders[idx].status = status;
  await storageWrite(KEY, orders);
  return Response.json(orders[idx]);
}
