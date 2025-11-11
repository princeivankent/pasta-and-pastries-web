import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem } from '../models/cart-item';
import { Product, ProductVariant } from '../models/product';
import { Firestore, doc, getDoc, setDoc, Timestamp } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

interface FirestoreCart {
  items: CartItem[];
  updatedAt: Timestamp;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'pasta-haus-cart';
  private readonly MERGE_COMPLETED_KEY = 'pasta-haus-cart-merged';
  private isBrowser: boolean;
  private useMockData = environment.useMockData;
  private cartSyncInProgress = false;
  private mergedUserId: string | null = null;

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    private firestore: Firestore,
    private authService: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Subscribe to auth state changes to sync cart
    this.authService.user$.subscribe(user => {
      if (user) {
        this.handleUserSignIn(user.uid);
      } else {
        // User signed out - reset merge tracking
        this.mergedUserId = null;
        if (this.isBrowser) {
          sessionStorage.removeItem(this.MERGE_COMPLETED_KEY);
        }
      }
    });
  }

  getCartItems(): CartItem[] {
    if (!this.isBrowser) {
      return [];
    }
    const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  }

  async addToCart(product: Product, quantity: number, specialInstructions?: string, selectedVariant?: ProductVariant): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    const cart = this.getCartItems();

    // Check if product already exists in cart with same variant and instructions
    const existingItemIndex = cart.findIndex(item =>
      item.product.id === product.id &&
      item.specialInstructions === specialInstructions &&
      item.selectedVariant?.id === selectedVariant?.id
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item exists with same instructions and variant
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.push({
        product,
        quantity,
        specialInstructions,
        selectedVariant
      });
    }

    await this.saveCart(cart);
  }

  async removeFromCart(index: number): Promise<void> {
    if (!this.isBrowser) {
      return;
    }
    const cart = this.getCartItems();
    cart.splice(index, 1);
    await this.saveCart(cart);
  }

  async updateQuantity(index: number, quantity: number): Promise<void> {
    if (!this.isBrowser) {
      return;
    }
    const cart = this.getCartItems();
    if (cart[index] && quantity > 0) {
      cart[index].quantity = quantity;
      await this.saveCart(cart);
    }
  }

  async clearCart(): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    // Clear localStorage
    localStorage.removeItem(this.CART_STORAGE_KEY);

    // Clear merge tracking
    sessionStorage.removeItem(this.MERGE_COMPLETED_KEY);

    // Clear Firestore if using production mode and user is authenticated
    if (!this.useMockData && this.authService.getCurrentUser()) {
      const user = this.authService.getCurrentUser();
      if (user) {
        const cartRef = doc(this.firestore, `carts/${user.uid}`);
        await setDoc(cartRef, {
          items: [],
          updatedAt: Timestamp.now()
        });
      }
    }
  }

  getCartCount(): number {
    const cart = this.getCartItems();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal(): number {
    const cart = this.getCartItems();
    return cart.reduce((total, item) => {
      const price = item.selectedVariant?.price ?? item.product.price;
      return total + (price * item.quantity);
    }, 0);
  }

  private async saveCart(cart: CartItem[]): Promise<void> {
    if (!this.isBrowser) {
      return;
    }

    // Always save to localStorage first for immediate access
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));

    // If in production mode and user is authenticated, sync to Firestore
    if (!this.useMockData && this.authService.getCurrentUser() && !this.cartSyncInProgress) {
      await this.syncCartToFirestore(cart);
    }
  }

  private async syncCartToFirestore(cart: CartItem[]): Promise<void> {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    try {
      const cartRef = doc(this.firestore, `carts/${user.uid}`);
      await setDoc(cartRef, {
        items: cart,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error syncing cart to Firestore:', error);
      // Cart is still saved in localStorage, so user can continue shopping
    }
  }

  private async loadCartFromFirestore(): Promise<CartItem[]> {
    const user = this.authService.getCurrentUser();
    if (!user) return [];

    try {
      const cartRef = doc(this.firestore, `carts/${user.uid}`);
      const cartDoc = await getDoc(cartRef);

      if (cartDoc.exists()) {
        const data = cartDoc.data() as FirestoreCart;
        return data.items || [];
      }
    } catch (error) {
      console.error('Error loading cart from Firestore:', error);
    }

    return [];
  }

  private async handleUserSignIn(userId: string): Promise<void> {
    if (!this.isBrowser || this.useMockData || this.cartSyncInProgress) {
      return;
    }

    // Check if we've already merged for this user in this session
    const mergeCompletedKey = sessionStorage.getItem(this.MERGE_COMPLETED_KEY);
    if (this.mergedUserId === userId || mergeCompletedKey === userId) {
      console.log('Cart merge already completed for this user in this session');
      return;
    }

    this.cartSyncInProgress = true;

    try {
      // Get current localStorage cart
      const localCart = this.getCartItems();

      // Load cart from Firestore
      const firestoreCart = await this.loadCartFromFirestore();

      // Only merge if there's something to merge
      let finalCart: CartItem[];

      if (localCart.length === 0) {
        // No local cart - just use Firestore cart
        finalCart = firestoreCart;
        console.log('Using Firestore cart (no local items)');
      } else if (firestoreCart.length === 0) {
        // No Firestore cart - use local cart
        finalCart = localCart;
        console.log('Using local cart (no Firestore items)');
      } else {
        // Both exist - merge them
        finalCart = this.mergeCarts(localCart, firestoreCart);
        console.log('Merged local and Firestore carts');
      }

      // Save merged cart to localStorage
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(finalCart));

      // Sync to Firestore
      await this.syncCartToFirestore(finalCart);

      // Mark merge as completed for this user
      this.mergedUserId = userId;
      sessionStorage.setItem(this.MERGE_COMPLETED_KEY, userId);

      console.log('Cart merge completed successfully');
    } catch (error) {
      console.error('Error handling user sign-in for cart:', error);
    } finally {
      this.cartSyncInProgress = false;
    }
  }

  private mergeCarts(localCart: CartItem[], firestoreCart: CartItem[]): CartItem[] {
    const merged = [...firestoreCart];

    // Add items from local cart that don't exist in Firestore cart
    for (const localItem of localCart) {
      const existingIndex = merged.findIndex(item =>
        item.product.id === localItem.product.id &&
        item.specialInstructions === localItem.specialInstructions &&
        item.selectedVariant?.id === localItem.selectedVariant?.id
      );

      if (existingIndex !== -1) {
        // Item exists in both carts - add quantities
        merged[existingIndex].quantity += localItem.quantity;
      } else {
        // Item only exists in local cart - add it
        merged.push(localItem);
      }
    }

    return merged;
  }
}
