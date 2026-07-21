export type Category = '台灯' | '包' | '扇子' | '书签' | '镜子' | '笔记本' | '画' | '画框';

export const CATEGORIES: Category[] = ['台灯', '包', '扇子', '书签', '镜子', '笔记本', '画', '画框'];

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string;
  images: string[];
  stock: number;
  minOrder: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderForm {
  name: string;
  phone: string;
  address: string;
  note?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  customer: OrderForm;
  status: 'pending' | 'confirmed' | 'shipped';
  createdAt: string;
}
