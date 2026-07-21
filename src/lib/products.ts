import { Product } from '@/types';
import productsData from '@/data/products.json';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'products.json');

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function ensureDataFile() {
  ensureDataDir();
  if (!existsSync(DATA_FILE)) {
    // First-time init: copy template data
    writeFileSync(DATA_FILE, JSON.stringify(productsData, null, 2), 'utf-8');
  }
  // NEVER overwrite — runtime data is the source of truth
}

// Always read fresh from disk
function readProducts(): Product[] {
  ensureDataFile();
  try {
    const raw = readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as Product[];
  } catch {
    return [...(productsData as Product[])];
  }
}

function writeProducts(products: Product[]) {
  ensureDataDir();
  writeFileSync(DATA_FILE, JSON.stringify(products, null, 2), 'utf-8');
}

export function getProducts(category?: string): Product[] {
  const all = readProducts();
  const filtered = category
    ? all.filter((p) => p.category === category)
    : all;
  // Sort: in-stock first, sold out last
  return filtered.sort((a, b) => {
    if (a.stock > 0 && b.stock === 0) return -1;
    if (a.stock === 0 && b.stock > 0) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function getProduct(id: string): Product | undefined {
  return readProducts().find((p) => p.id === id);
}

export function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
  const products = readProducts();
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  writeProducts(products);
  return newProduct;
}

export function updateProduct(id: string, data: Partial<Product>): Product | null {
  const products = readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], ...data };
  writeProducts(products);
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const products = readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  writeProducts(products);
  return true;
}

export function getAllProducts(): Product[] {
  return readProducts();
}
