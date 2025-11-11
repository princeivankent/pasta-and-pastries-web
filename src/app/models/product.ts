export type ProductStatus = 'available' | 'sold-out' | 'unavailable';

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  servings?: string;
  dimensions?: string;
  status?: ProductStatus; // Status for individual variants
}

export interface Product {
  id: string;
  name: string;
  category: 'pasta' | 'pastry';
  description: string;
  price: number;
  image: string;
  ingredients?: string[];
  isBestSeller?: boolean;
  variants?: ProductVariant[];
  status?: ProductStatus; // Status for the entire product (defaults to 'available')
}
