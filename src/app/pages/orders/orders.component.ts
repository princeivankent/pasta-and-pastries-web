import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CheckoutService } from '../../services/checkout.service';
import { AuthService } from '../../services/auth.service';
import { SeoService } from '../../services/seo.service';
import { Order } from '../../models/order';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit, OnDestroy {
  private checkoutService = inject(CheckoutService);
  private authService = inject(AuthService);
  private seoService = inject(SeoService);
  private router = inject(Router);

  orders: Order[] = [];
  isLoading = true;
  errorMessage = '';
  currentUser$ = this.authService.user$;
  private subscriptions = new Subscription();

  constructor() {}

  ngOnInit(): void {
    // Set SEO meta tags for orders page
    this.seoService.updateMetaTags({
      title: 'My Orders - Pasta & Pastries by Cha',
      description: 'Track your orders and view order history for Pasta & Pastries by Cha.',
      keywords: 'order tracking, order history, my orders, pasta orders, pastry orders',
      url: 'https://pastaandpastriesbycha.com/orders',
      type: 'website'
    });

    // Subscribe to auth state and load orders when user is authenticated
    const authSub = this.authService.user$.subscribe({
      next: (user) => {
        if (user) {
          // User is signed in, start listening to orders in realtime
          this.loadOrdersRealtime(user.uid);
        } else {
          // User is not signed in
          this.isLoading = false;
          this.orders = [];
        }
      },
      error: (error) => {
        console.error('Error with auth state:', error);
        this.isLoading = false;
        this.errorMessage = 'Authentication error. Please try again.';
      }
    });

    this.subscriptions.add(authSub);
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.unsubscribe();
  }

  loadOrdersRealtime(userId: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Subscribe to realtime orders updates
    const ordersSub = this.checkoutService.getOrdersRealtime(userId).subscribe({
      next: (orders) => {
        // Sort orders by date (newest first)
        this.orders = orders.sort((a, b) =>
          new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.errorMessage = error.message || 'Failed to load orders. Please try again.';
        this.isLoading = false;
      }
    });

    this.subscriptions.add(ordersSub);
  }

  async signInWithGoogle(): Promise<void> {
    try {
      await this.authService.signInWithGoogle();
      // Orders will be loaded automatically via the auth state subscription
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  }

  getStatusBadgeClass(status: Order['status']): string {
    switch (status) {
      case 'pending':
        return 'badge-warning';
      case 'confirmed':
        return 'badge-info';
      case 'preparing':
        return 'badge-primary';
      case 'ready':
        return 'badge-success';
      case 'completed':
        return 'badge-neutral';
      case 'cancelled':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  }

  getStatusLabel(status: Order['status']): string {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'preparing':
        return 'Preparing';
      case 'ready':
        return 'Ready for Pickup/Delivery';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return `₱${amount.toFixed(2)}`;
  }

  getItemPrice(item: any): number {
    return item.selectedVariant?.price || item.product.price;
  }
}
