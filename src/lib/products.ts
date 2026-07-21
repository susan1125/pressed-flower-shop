import { Product } from '@/types';
import productsData from '@/data/products.json';
import { storageRead, storageWrite } from './storage';

const KEY = 'products';

async function readProducts(): Promise<Product[]> {
  return storageRead<Product[]>(KEY, [...(productsData as Product[])]);
}

async function writeProducts(products: Product[]) {
  await storageWrite(KEY, products);
}

export async function getProducts(category?: string): Promise<Product[]> {
  const all = await readProducts();
  const filtered = category
    ? all.filter((p) => p.category === category)
    : all;
  return filtered.sort((a, b) => {
    if (a.stock > 0 && b.stock === 0) return -1;
    if (a.stock === 0 && b.stock > 0) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export async function getProduct(id: string): Promise<Product | undefined> {
  return (await readProducts()).find((p) => p.id === id);
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  const products = await readProducts();
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  products.push(newProduct);
  await writeProducts(products);
  return newProduct;
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  const products = await readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  products[index] = { ...products[index], ...data };
  await writeProducts(products);
  return products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  const products = await readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  await writeProducts(products);
  return true;
}

export async function getAllProducts(): Promise<Product[]> {
  return readProducts();
}
