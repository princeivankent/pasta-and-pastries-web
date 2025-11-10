import { CartItem } from './cart-item';

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  orderType: 'pickup' | 'delivery';
  specialInstructions?: string;
  orderDate: Date;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
  userId?: string; // Firebase Auth user ID (required in production)
}
