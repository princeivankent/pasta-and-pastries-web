import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { AuthService } from '../../services/auth.service';
import { CartItem } from '../../models/cart-item';
import { User } from '@angular/fire/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isCartOpen = false;
  cartItems: CartItem[] = [];
  cartCount = 0;
  cartTotal = 0;
  cartBadgePulse = false;
  currentUser: User | null = null;
  isUserMenuOpen = false;
  private cartCheckInterval: any;
  private isBrowser: boolean;
  private previousCartCount = 0;

  constructor(
    public cartService: CartService,
    public checkoutService: CheckoutService,
    public authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.updateCart();
    // Subscribe to auth state changes
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
    // Check for cart updates every second - only in browser
    if (this.isBrowser) {
      this.cartCheckInterval = setInterval(() => {
        this.updateCart();
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.cartCheckInterval) {
      clearInterval(this.cartCheckInterval);
    }
  }

  updateCart(): void {
    this.cartItems = this.cartService.getCartItems();
    const newCartCount = this.cartService.getCartCount();
    this.cartTotal = this.cartService.getCartTotal();

    // Trigger animation when cart count increases
    if (newCartCount > this.previousCartCount) {
      this.triggerCartBadgeAnimation();
    }

    this.previousCartCount = this.cartCount;
    this.cartCount = newCartCount;
  }

  private triggerCartBadgeAnimation(): void {
    this.cartBadgePulse = true;
    setTimeout(() => {
      this.cartBadgePulse = false;
    }, 600);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isCartOpen = false;
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
    if (this.isCartOpen) {
      this.isMobileMenuOpen = false;
      this.updateCart();
    }
  }

  closeCart() {
    this.isCartOpen = false;
  }

  removeItem(index: number): void {
    this.cartService.removeFromCart(index);
    this.updateCart();
  }

  incrementQuantity(index: number): void {
    const item = this.cartItems[index];
    if (item) {
      this.cartService.updateQuantity(index, item.quantity + 1);
      this.updateCart();
    }
  }

  decrementQuantity(index: number): void {
    const item = this.cartItems[index];
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(index, item.quantity - 1);
      this.updateCart();
    }
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.updateCart();
  }

  proceedToCheckout(): void {
    // For now, just create a pickup order
    // In a real app, this would navigate to a checkout page
    const order = this.checkoutService.createOrder('pickup');
    if (order) {
      alert(`Order created successfully! Order ID: ${order.id}\n\nTotal: ₱${order.totalAmount}\n\nThank you for your order!`);
      this.cartService.clearCart();
      this.updateCart();
      this.closeCart();
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  async signIn(): Promise<void> {
    try {
      await this.authService.signInWithGoogle();
      this.closeUserMenu();
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.authService.signOutUser();
      this.closeUserMenu();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  }
}
