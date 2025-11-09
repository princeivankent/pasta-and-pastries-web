import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartItem } from '../models/cart-item';
import { Product } from '../models/product';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'pasta-haus-cart';
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  getCartItems(): CartItem[] {
    if (!this.isBrowser) {
      return [];
    }
    const cartData = localStorage.getItem(this.CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  }

  addToCart(product: Product, quantity: number, specialInstructions?: string): void {
    if (!this.isBrowser) {
      return;
    }

    const cart = this.getCartItems();

    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item =>
      item.product.id === product.id &&
      item.specialInstructions === specialInstructions
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item exists with same instructions
      cart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      cart.push({
        product,
        quantity,
        specialInstructions
      });
    }

    this.saveCart(cart);
  }

  removeFromCart(index: number): void {
    if (!this.isBrowser) {
      return;
    }
    const cart = this.getCartItems();
    cart.splice(index, 1);
    this.saveCart(cart);
  }

  updateQuantity(index: number, quantity: number): void {
    if (!this.isBrowser) {
      return;
    }
    const cart = this.getCartItems();
    if (cart[index] && quantity > 0) {
      cart[index].quantity = quantity;
      this.saveCart(cart);
    }
  }

  clearCart(): void {
    if (!this.isBrowser) {
      return;
    }
    localStorage.removeItem(this.CART_STORAGE_KEY);
  }

  getCartCount(): number {
    const cart = this.getCartItems();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  getCartTotal(): number {
    const cart = this.getCartItems();
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  private saveCart(cart: CartItem[]): void {
    if (!this.isBrowser) {
      return;
    }
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
  }
}
