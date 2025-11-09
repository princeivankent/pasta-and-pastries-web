import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, docData, query, where } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Product } from '../models/product';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private firestore = inject(Firestore);

  // Mock data for development (to avoid Firestore read costs)
  private mockProducts: Product[] = [
    {
      id: '1',
      name: 'Lasagna',
      category: 'pasta',
      description: 'Creamy layers with 100% beef and mozzarella',
      price: 180,
      image: 'images/lasagna.jpg',
      isBestSeller: true,
      ingredients: ['Pasta sheets', 'Beef', 'Mozzarella', 'Tomato sauce', 'Herbs'],
      variants: [
        {
          id: 'small',
          label: 'Small',
          price: 180,
          servings: 'Good for 2 persons',
          dimensions: '7.5" x 4.33" x 1.77" 550ml'
        },
        {
          id: 'medium',
          label: 'Medium',
          price: 399,
          servings: 'Good for 4-5 persons',
          dimensions: '9" x 6.6" x 1.9" 1100ml'
        },
        {
          id: 'large',
          label: 'Large',
          price: 799,
          servings: 'Good for 6-9 persons',
          dimensions: '12" x 8" x 2" 2300ml'
        }
      ]
    },
    {
      id: '2',
      name: 'Cheesy Baked Mac',
      category: 'pasta',
      description: 'Rich and creamy baked macaroni with cheese',
      price: 140,
      image: 'images/cheesy-baked-mac.jpg',
      isBestSeller: true,
      ingredients: ['Macaroni', 'Cheddar cheese', 'Milk', 'Butter', 'Breadcrumbs']
    },
    {
      id: '3',
      name: 'Choco Banana Muffins',
      category: 'pastry',
      description: 'Moist chocolate muffins with ripe bananas - Box of 4',
      price: 130,
      image: 'images/choco-banana-muffins.jpg',
      isBestSeller: true,
      ingredients: ['Ripe bananas', 'Chocolate chips', 'Flour', 'Sugar', 'Eggs']
    },
    {
      id: '4',
      name: 'Carrot Muffins',
      category: 'pastry',
      description: 'Sweet and spiced carrot muffins - Box of 4',
      price: 260,
      image: 'images/carot-muffins.jpg',
      isBestSeller: true,
      ingredients: ['Carrots', 'Flour', 'Cinnamon', 'Sugar', 'Walnuts']
    }
  ];

  constructor() { }

  /**
   * Get all products - returns Observable for Firestore, synchronous for mock data
   */
  getAllProducts(): Observable<Product[]> {
    if (environment.useMockData) {
      return of(this.mockProducts);
    }

    const productsCollection = collection(this.firestore, 'products');
    return collectionData(productsCollection, { idField: 'id' }).pipe(
      map(products => products as Product[]),
      catchError(error => {
        console.error('Error fetching products from Firestore:', error);
        // Fallback to mock data on error
        return of(this.mockProducts);
      })
    );
  }

  /**
   * Get best seller products
   */
  getBestSellers(): Observable<Product[]> {
    if (environment.useMockData) {
      return of(this.mockProducts.filter(p => p.isBestSeller));
    }

    const productsCollection = collection(this.firestore, 'products');
    const bestSellersQuery = query(productsCollection, where('isBestSeller', '==', true));

    return collectionData(bestSellersQuery, { idField: 'id' }).pipe(
      map(products => products as Product[]),
      catchError(error => {
        console.error('Error fetching best sellers from Firestore:', error);
        return of(this.mockProducts.filter(p => p.isBestSeller));
      })
    );
  }

  /**
   * Get products by category
   */
  getProductsByCategory(category: 'pasta' | 'pastry'): Observable<Product[]> {
    if (environment.useMockData) {
      return of(this.mockProducts.filter(p => p.category === category));
    }

    const productsCollection = collection(this.firestore, 'products');
    const categoryQuery = query(productsCollection, where('category', '==', category));

    return collectionData(categoryQuery, { idField: 'id' }).pipe(
      map(products => products as Product[]),
      catchError(error => {
        console.error(`Error fetching ${category} products from Firestore:`, error);
        return of(this.mockProducts.filter(p => p.category === category));
      })
    );
  }

  /**
   * Get product by ID
   */
  getProductById(id: string): Observable<Product | undefined> {
    if (environment.useMockData) {
      return of(this.mockProducts.find(p => p.id === id));
    }

    const productDoc = doc(this.firestore, `products/${id}`);
    return docData(productDoc, { idField: 'id' }).pipe(
      map(product => product as Product),
      catchError(error => {
        console.error(`Error fetching product ${id} from Firestore:`, error);
        return of(this.mockProducts.find(p => p.id === id));
      })
    );
  }
}
