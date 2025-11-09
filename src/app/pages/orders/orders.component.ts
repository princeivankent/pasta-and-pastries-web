import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CheckoutService } from '../../services/checkout.service';
import { AuthService } from '../../services/auth.service';
import { SeoService } from '../../services/seo.service';
import { Order } from '../../models/order';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, RouterLink],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent implements OnInit {
  private checkoutService = inject(CheckoutService);
  private authService = inject(AuthService);
  private seoService = inject(SeoService);
  private router = inject(Router);

  orders: Order[] = [];
  isLoading = true;
  errorMessage = '';
  currentUser$ = this.authService.user$;

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

    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.checkoutService.getOrders().subscribe({
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
  }

  async signInWithGoogle(): Promise<void> {
    try {
      await this.authService.signInWithGoogle();
      // After successful sign-in, reload orders
      this.loadOrders();
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
