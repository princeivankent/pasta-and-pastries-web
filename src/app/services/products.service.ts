import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, collectionData, doc, docData, query, where, updateDoc } from '@angular/fire/firestore';
import { Observable, of, BehaviorSubject, Subscription } from 'rxjs';
import { map, catchError, take, shareReplay, filter } from 'rxjs/operators';
import { Product, ProductStatus } from '../models/product';
import { environment } from '../../environments/environment';

/**
 * OPTIMIZATION STRATEGY FOR FIREBASE SPARK (FREE) PLAN:
 *
 * 1. SHARED SUBSCRIPTIONS: Only ONE Firestore listener per query, even with multiple subscribers
 *    - Prevents multiple connections from home/menu/admin components
 *    - Reduces connection overhead and memory usage
 *
 * 2. FIRESTORE CACHE (enabled in app.config.ts):
 *    - Uses IndexedDB persistence for offline-first data access
 *    - Serves cached data immediately, reducing network reads
 *    - Updates cache when Firestore sends changes
 *
 * 3. REAL-TIME UPDATES:
 *    - Customers see sold-out status immediately (prevents adding unavailable items to cart)
 *    - Admin sees instant updates when changing product status
 *    - Only changed documents trigger reads (not full collection re-reads)
 *
 * 4. INACTIVE TAB BEHAVIOR:
 *    - Firestore listeners remain active in background tabs
 *    - Still consumes reads when updates occur (unavoidable with real-time)
 *    - Firestore automatically switches to long-polling in inactive tabs (more efficient than WebSocket)
 *
 * EXPECTED COST (50k reads/day free limit):
 * - Initial load: ~10 reads per customer (served from cache on reload)
 * - Admin updates: 1 read per connected customer per update
 * - Example: 100 active customers + 5 updates/day = 500 reads/day (well within limit)
 */
@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Shared observables to prevent multiple Firestore listeners
  private allProductsSubject$ = new BehaviorSubject<Product[]>([]);
  private allProductsSubscription?: Subscription;
  private isLoadingProducts = false;

  private bestSellersSubject$ = new BehaviorSubject<Product[]>([]);
  private bestSellersSubscription?: Subscription;
  private isLoadingBestSellers = false;

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
    // Use mock data during SSR or when explicitly configured
    if (!this.isBrowser || environment.useMockData) {
      return of(this.mockProducts);
    }

    const productsCollection = collection(this.firestore, 'products');
    return collectionData(productsCollection, { idField: 'id' }).pipe(
      take(1), // Complete after first emission to prevent continuous listening
      map(products => products as Product[]),
      catchError(error => {
        console.error('Error fetching products from Firestore:', error);
        // Fallback to mock data on error
        return of(this.mockProducts);
      })
    );
  }

  /**
   * Get all products with real-time updates - SHARED subscription
   * Multiple components can subscribe without creating multiple Firestore listeners
   */
  getAllProductsRealtime(): Observable<Product[]> {
    // Use mock data during SSR or when explicitly configured
    if (!this.isBrowser || environment.useMockData) {
      return of(this.mockProducts);
    }

    // Initialize the shared subscription only once
    if (!this.allProductsSubscription && !this.isLoadingProducts) {
      this.isLoadingProducts = true;
      const productsCollection = collection(this.firestore, 'products');

      this.allProductsSubscription = collectionData(productsCollection, { idField: 'id' }).pipe(
        map(products => products as Product[]),
        catchError(error => {
          console.error('Error fetching products from Firestore:', error);
          this.isLoadingProducts = false;
          return of(this.mockProducts);
        })
      ).subscribe(products => {
        this.allProductsSubject$.next(products);
        this.isLoadingProducts = false;
      });
    }

    // Return the shared observable - all subscribers share the same Firestore listener
    return this.allProductsSubject$.asObservable().pipe(
      filter(products => products.length > 0 || !this.isLoadingProducts)
    );
  }

  /**
   * Get best seller products (one-time fetch)
   */
  getBestSellers(): Observable<Product[]> {
    // Use mock data during SSR or when explicitly configured
    if (!this.isBrowser || environment.useMockData) {
      return of(this.mockProducts.filter(p => p.isBestSeller));
    }

    const productsCollection = collection(this.firestore, 'products');
    const bestSellersQuery = query(productsCollection, where('isBestSeller', '==', true));

    return collectionData(bestSellersQuery, { idField: 'id' }).pipe(
      take(1), // Complete after first emission to prevent continuous listening
      map(products => products as Product[]),
      catchError(error => {
        console.error('Error fetching best sellers from Firestore:', error);
        return of(this.mockProducts.filter(p => p.isBestSeller));
      })
    );
  }

  /**
   * Get best seller products with real-time updates - SHARED subscription
   * Multiple components can subscribe without creating multiple Firestore listeners
   */
  getBestSellersRealtime(): Observable<Product[]> {
    // Use mock data during SSR or when explicitly configured
    if (!this.isBrowser || environment.useMockData) {
      return of(this.mockProducts.filter(p => p.isBestSeller));
    }

    // Initialize the shared subscription only once
    if (!this.bestSellersSubscription && !this.isLoadingBestSellers) {
      this.isLoadingBestSellers = true;
      const productsCollection = collection(this.firestore, 'products');
      const bestSellersQuery = query(productsCollection, where('isBestSeller', '==', true));

      this.bestSellersSubscription = collectionData(bestSellersQuery, { idField: 'id' }).pipe(
        map(products => products as Product[]),
        catchError(error => {
          console.error('Error fetching best sellers from Firestore:', error);
          this.isLoadingBestSellers = false;
          return of(this.mockProducts.filter(p => p.isBestSeller));
        })
      ).subscribe(products => {
        this.bestSellersSubject$.next(products);
        this.isLoadingBestSellers = false;
      });
    }

    // Return the shared observable - all subscribers share the same Firestore listener
    return this.bestSellersSubject$.asObservable().pipe(
      filter(products => products.length > 0 || !this.isLoadingBestSellers)
    );
  }

  /**
   * Get products by category
   */
  getProductsByCategory(category: 'pasta' | 'pastry'): Observable<Product[]> {
    // Use mock data during SSR or when explicitly configured
    if (!this.isBrowser || environment.useMockData) {
      return of(this.mockProducts.filter(p => p.category === category));
    }

    const productsCollection = collection(this.firestore, 'products');
    const categoryQuery = query(productsCollection, where('category', '==', category));

    return collectionData(categoryQuery, { idField: 'id' }).pipe(
      take(1), // Complete after first emission to prevent continuous listening
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
    // Use mock data during SSR or when explicitly configured
    if (!this.isBrowser || environment.useMockData) {
      return of(this.mockProducts.find(p => p.id === id));
    }

    const productDoc = doc(this.firestore, `products/${id}`);
    return docData(productDoc, { idField: 'id' }).pipe(
      take(1), // Complete after first emission to prevent continuous listening
      map(product => product as Product),
      catchError(error => {
        console.error(`Error fetching product ${id} from Firestore:`, error);
        return of(this.mockProducts.find(p => p.id === id));
      })
    );
  }

  /**
   * Update product status (admin only)
   */
  async updateProductStatus(productId: string, status: ProductStatus): Promise<void> {
    if (!this.isBrowser || environment.useMockData) {
      console.log('Mock mode: Product status update skipped');
      return;
    }

    try {
      const productDoc = doc(this.firestore, `products/${productId}`);
      await updateDoc(productDoc, { status });
      console.log(`Product ${productId} status updated to ${status}`);
    } catch (error) {
      console.error('Error updating product status:', error);
      throw error;
    }
  }

  /**
   * Update variant status (admin only)
   */
  async updateVariantStatus(productId: string, variantId: string, status: ProductStatus): Promise<void> {
    if (!this.isBrowser || environment.useMockData) {
      console.log('Mock mode: Variant status update skipped');
      return;
    }

    try {
      // First, get the product to update the specific variant
      const productDoc = doc(this.firestore, `products/${productId}`);
      const productData = await docData(productDoc, { idField: 'id' }).pipe(take(1)).toPromise();

      if (productData && (productData as Product).variants) {
        const product = productData as Product;
        const updatedVariants = product.variants!.map(v =>
          v.id === variantId ? { ...v, status } : v
        );

        await updateDoc(productDoc, { variants: updatedVariants });
        console.log(`Variant ${variantId} of product ${productId} status updated to ${status}`);
      }
    } catch (error) {
      console.error('Error updating variant status:', error);
      throw error;
    }
  }
}
