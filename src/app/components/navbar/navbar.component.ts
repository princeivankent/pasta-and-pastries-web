import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { CartItem } from '../../models/cart-item';

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
  private cartCheckInterval: any;
  private isBrowser: boolean;

  constructor(
    public cartService: CartService,
    public checkoutService: CheckoutService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.updateCart();
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
    this.cartCount = this.cartService.getCartCount();
    this.cartTotal = this.cartService.getCartTotal();
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
}
