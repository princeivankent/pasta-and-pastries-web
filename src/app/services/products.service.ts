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
      description: 'Creamy layers with 100% beet and mozzarella',
      price: 280,
      image: 'assets/images/products/lasagna.svg',
      isBestSeller: true,
      ingredients: ['Pasta sheets', 'Beet', 'Mozzarella', 'Tomato sauce', 'Herbs']
    },
    {
      id: 2,
      name: 'Banana Muffins',
      category: 'pastry',
      description: 'Moist and fluffy with ripe bananas',
      price: 100,
      image: 'assets/images/products/banana-muffins.svg',
      isBestSeller: true,
      ingredients: ['Ripe bananas', 'Flour', 'Sugar', 'Eggs', 'Butter']
    },
    {
      id: 3,
      name: 'Banana Loaf',
      category: 'pastry',
      description: 'Sweet and tender with a hint of banana',
      price: 150,
      image: 'assets/images/products/banana-loaf.svg',
      isBestSeller: true,
      ingredients: ['Bananas', 'Flour', 'Brown sugar', 'Walnuts']
    },
    {
      id: 4,
      name: 'Crinkles',
      category: 'pastry',
      description: 'Soft and chewy chocolate cookies',
      price: 0,
      image: 'assets/images/products/crinkles.svg',
      isBestSeller: true,
      ingredients: ['Chocolate', 'Flour', 'Sugar', 'Eggs', 'Powdered sugar']
    },
    {
      id: 5,
      name: 'Fettuccine Alfredo',
      category: 'pasta',
      description: 'Rich and creamy pasta with parmesan sauce',
      price: 250,
      image: 'assets/images/products/fettuccine.svg',
      ingredients: ['Fettuccine', 'Heavy cream', 'Parmesan', 'Butter', 'Garlic']
    },
    {
      id: 6,
      name: 'Ravioli',
      category: 'pasta',
      description: 'Handmade pasta pockets filled with ricotta and spinach',
      price: 300,
      image: 'assets/images/products/ravioli.svg',
      ingredients: ['Fresh pasta', 'Ricotta', 'Spinach', 'Parmesan', 'Tomato sauce']
    },
    {
      id: 7,
      name: 'Chocolate Croissant',
      category: 'pastry',
      description: 'Flaky, buttery pastry with rich chocolate filling',
      price: 120,
      image: 'assets/images/products/croissant.svg',
      ingredients: ['Butter', 'Flour', 'Dark chocolate', 'Yeast', 'Milk']
    },
    {
      id: 8,
      name: 'Tiramisu',
      category: 'pastry',
      description: 'Classic Italian dessert with coffee and mascarpone',
      price: 180,
      image: 'assets/images/products/tiramisu.svg',
      ingredients: ['Ladyfingers', 'Mascarpone', 'Espresso', 'Cocoa powder', 'Eggs']
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
