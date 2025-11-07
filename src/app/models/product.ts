export interface Product {
  id: number;
  name: string;
  category: 'pasta' | 'pastry';
  description: string;
  price: number;
  image: string;
  ingredients?: string[];
  isBestSeller?: boolean;
}
