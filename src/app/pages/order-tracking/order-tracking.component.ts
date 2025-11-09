import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CheckoutService } from '../../services/checkout.service';
import { AuthService } from '../../services/auth.service';
import { Order } from '../../models/order';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-tracking.component.html',
  styleUrl: './order-tracking.component.scss'
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  isLoading = true;
  errorMessage = '';
  isAuthenticated = false;
  private ordersSubscription?: Subscription;

  constructor(
    private checkoutService: CheckoutService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated
    this.authService.user$.subscribe(user => {
      this.isAuthenticated = !!user;

      if (user) {
        this.loadUserOrders();
      } else {
        this.isLoading = false;
        this.errorMessage = 'Please sign in to view your orders';
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
  }

  loadUserOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Subscribe to real-time order updates
    this.ordersSubscription = this.checkoutService.getUserOrdersRealtime().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.errorMessage = 'Failed to load orders. Please try again.';
        this.isLoading = false;
      }
    });
  }

  async signIn(): Promise<void> {
    try {
      await this.authService.signInWithGoogle();
    } catch (error) {
      console.error('Sign-in failed:', error);
      this.errorMessage = 'Sign-in failed. Please try again.';
    }
  }

  getStatusClass(status: Order['status']): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'badge-warning',
      'confirmed': 'badge-info',
      'preparing': 'badge-primary',
      'ready': 'badge-success',
      'completed': 'badge-neutral',
      'cancelled': 'badge-error'
    };
    return statusClasses[status] || 'badge-ghost';
  }

  getStatusIcon(status: Order['status']): string {
    const statusIcons: { [key: string]: string } = {
      'pending': '⏳',
      'confirmed': '✓',
      'preparing': '👨‍🍳',
      'ready': '🎉',
      'completed': '✅',
      'cancelled': '❌'
    };
    return statusIcons[status] || '📋';
  }

  getStatusText(status: Order['status']): string {
    const statusTexts: { [key: string]: string } = {
      'pending': 'Order Pending',
      'confirmed': 'Order Confirmed',
      'preparing': 'Preparing Your Order',
      'ready': 'Ready for Pickup/Delivery',
      'completed': 'Order Completed',
      'cancelled': 'Order Cancelled'
    };
    return statusTexts[status] || status;
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
    return `$${amount.toFixed(2)}`;
  }
}
