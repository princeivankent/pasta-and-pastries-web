import { Injectable } from '@angular/core';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private products: Product[] = [
    {
      id: 1,
      name: 'Lasagna',
      category: 'pasta',
      description: 'Creamy layers with 100% beef and mozzarella',
      price: 280,
      image: 'images/lasagna.jpg',
      isBestSeller: true,
      ingredients: ['Pasta sheets', 'Beef', 'Mozzarella', 'Tomato sauce', 'Herbs']
    },
    {
      id: 2,
      name: 'Cheesy Baked Mac',
      category: 'pasta',
      description: 'Rich and creamy baked macaroni with cheese',
      price: 250,
      image: 'images/cheesy-baked-mac.jpg',
      isBestSeller: true,
      ingredients: ['Macaroni', 'Cheddar cheese', 'Milk', 'Butter', 'Breadcrumbs']
    },
    {
      id: 3,
      name: 'Choco Banana Muffins',
      category: 'pastry',
      description: 'Moist chocolate muffins with ripe bananas',
      price: 100,
      image: 'images/choco-banana-muffins.jpg',
      isBestSeller: true,
      ingredients: ['Ripe bananas', 'Chocolate chips', 'Flour', 'Sugar', 'Eggs']
    },
    {
      id: 4,
      name: 'Carrot Muffins',
      category: 'pastry',
      description: 'Sweet and spiced carrot muffins',
      price: 100,
      image: 'images/carot-muffins.jpg',
      isBestSeller: true,
      ingredients: ['Carrots', 'Flour', 'Cinnamon', 'Sugar', 'Walnuts']
    }
  ];

  constructor() { }

  getAllProducts(): Product[] {
    return this.products;
  }

  getBestSellers(): Product[] {
    return this.products.filter(p => p.isBestSeller);
  }

  getProductsByCategory(category: 'pasta' | 'pastry'): Product[] {
    return this.products.filter(p => p.category === category);
  }

  getProductById(id: number): Product | undefined {
    return this.products.find(p => p.id === id);
  }
}
