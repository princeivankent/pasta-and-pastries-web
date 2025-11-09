export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  servings?: string;
  dimensions?: string;
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
}
