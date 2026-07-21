import { NextRequest } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const FILE = path.join(process.cwd(), 'data', 'orders.json');

function ensure() {
  const dir = path.dirname(FILE);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  if (!existsSync(FILE)) writeFileSync(FILE, '[]', 'utf-8');
}

function read() {
  ensure();
  return JSON.parse(readFileSync(FILE, 'utf-8'));
}

function write(data: unknown[]) {
  ensure();
  writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const order = { id: Date.now().toString(), ...body, createdAt: new Date().toISOString() };
  const orders = read();
  orders.push(order);
  write(orders);
  return Response.json(order, { status: 201 });
}

export async function GET() {
  return Response.json(read());
}
