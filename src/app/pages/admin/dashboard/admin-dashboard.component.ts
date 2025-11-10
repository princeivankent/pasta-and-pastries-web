import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { CheckoutService } from '../../../services/checkout.service';
import { ToastService } from '../../../services/toast.service';
import { Order } from '../../../models/order';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedStatus: string = 'all';
  isLoading: boolean = true;
  private ordersSubscription?: Subscription;
  private previousOrderCount: number = 0;

  statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'preparing', label: 'Preparing' },
    { value: 'ready', label: 'Ready' },
    { value: 'delivering', label: 'Delivering' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  constructor(
    private adminService: AdminService,
    private checkoutService: CheckoutService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Start real-time listener
    this.adminService.startRealtimeListener();

    // Subscribe to orders observable
    this.ordersSubscription = this.adminService.orders$.subscribe(orders => {
      // Check for new orders
      if (this.previousOrderCount > 0 && orders.length > this.previousOrderCount) {
        const newOrdersCount = orders.length - this.previousOrderCount;
        this.toastService.info(`${newOrdersCount} new order${newOrdersCount > 1 ? 's' : ''} received!`, 5000);
      }

      this.previousOrderCount = orders.length;
      this.orders = orders;
      this.filterOrders();
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription and listener
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
    this.adminService.stopRealtimeListener();
  }

  filterOrders(): void {
    if (this.selectedStatus === 'all') {
      this.filteredOrders = this.orders;
    } else {
      this.filteredOrders = this.orders.filter(order => order.status === this.selectedStatus);
    }
  }

  onStatusFilterChange(status: string): void {
    this.selectedStatus = status;
    this.filterOrders();
  }

  updateOrderStatus(orderId: string, newStatus: Order['status']): void {
    this.checkoutService.updateOrderStatus(orderId, newStatus).subscribe({
      next: (success) => {
        if (success) {
          this.toastService.success(`Order ${orderId} updated to ${newStatus}`);
          // The real-time listener will automatically update the orders
        } else {
          this.toastService.error('Failed to update order status');
        }
      },
      error: (error) => {
        console.error('Error updating order status:', error);
        this.toastService.error('Failed to update order status');
      }
    });
  }

  getNextStatus(currentStatus: Order['status']): Order['status'] | null {
    const statusFlow: Record<Order['status'], Order['status'] | null> = {
      'pending': 'confirmed',
      'confirmed': 'preparing',
      'preparing': 'ready',
      'ready': 'delivering',
      'delivering': 'completed',
      'completed': null,
      'cancelled': null
    };
    return statusFlow[currentStatus];
  }

  canAdvanceStatus(status: Order['status']): boolean {
    return this.getNextStatus(status) !== null;
  }

  advanceOrderStatus(order: Order): void {
    const nextStatus = this.getNextStatus(order.status);
    if (nextStatus) {
      this.updateOrderStatus(order.id, nextStatus);
    }
  }

  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.updateOrderStatus(orderId, 'cancelled');
    }
  }

  getStatusBadgeClass(status: Order['status']): string {
    const classes: Record<Order['status'], string> = {
      'pending': 'badge-warning',
      'confirmed': 'badge-info',
      'preparing': 'badge-primary',
      'ready': 'badge-success',
      'delivering': 'badge-accent',
      'completed': 'badge-neutral',
      'cancelled': 'badge-error'
    };
    return classes[status] || 'badge-ghost';
  }

  getTotalAmount(order: Order): number {
    return order.totalAmount;
  }

  getItemPrice(item: any): number {
    // If item has selectedVariant, use variant price, otherwise use product price
    return item.selectedVariant ? item.selectedVariant.price : item.product.price;
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  logout(): void {
    this.adminService.logout();
    this.toastService.success('Logged out successfully');
    this.router.navigate(['/admin/login']);
  }
}
