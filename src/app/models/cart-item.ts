import { Product, ProductVariant } from './product';

export interface CartItem {
  product: Product;
  quantity: number;
  specialInstructions?: string;
  selectedVariant?: ProductVariant;
}
