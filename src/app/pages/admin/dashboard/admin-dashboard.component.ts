import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { CheckoutService } from '../../../services/checkout.service';
import { ToastService } from '../../../services/toast.service';
import { NotificationService } from '../../../services/notification.service';
import { Order } from '../../../models/order';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  // Date filtering properties
  dateFilterType: 'today' | 'range' = 'today';
  startDate: string = '';
  endDate: string = '';

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
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize date inputs with today's date
    this.initializeDateFilters();

    // Start real-time listener with date filter (defaults to today)
    this.applyDateFilter();

    // Subscribe to orders observable
    this.ordersSubscription = this.adminService.orders$.subscribe(orders => {
      // Check for new orders
      if (this.previousOrderCount > 0 && orders.length > this.previousOrderCount) {
        const newOrdersCount = orders.length - this.previousOrderCount;

        // Show toast notification
        this.toastService.info(`${newOrdersCount} new order${newOrdersCount > 1 ? 's' : ''} received!`, 5000);

        // Play notification sound
        this.notificationService.playNotificationSound();

        // Optional: Show browser notification if permission granted
        this.notificationService.showBrowserNotification(
          'New Order Received!',
          `You have ${newOrdersCount} new order${newOrdersCount > 1 ? 's' : ''} to process.`
        );
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

  async enableNotifications(): Promise<void> {
    const granted = await this.notificationService.requestNotificationPermission();
    if (granted) {
      this.toastService.success('Browser notifications enabled!');
    } else {
      this.toastService.warning('Notification permission denied. You can still receive in-app notifications.');
    }
  }

  /**
   * Initialize date filter inputs with today's date
   */
  initializeDateFilters(): void {
    const today = new Date();
    this.startDate = this.formatDateForInput(today);
    this.endDate = this.formatDateForInput(today);
  }

  /**
   * Format date for HTML date input (YYYY-MM-DD)
   */
  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Apply date filter and restart real-time listener
   */
  applyDateFilter(): void {
    let startDateTime: Date;
    let endDateTime: Date;

    if (this.dateFilterType === 'today') {
      // Filter for today only
      startDateTime = new Date();
      startDateTime.setHours(0, 0, 0, 0);
      endDateTime = new Date();
      endDateTime.setHours(23, 59, 59, 999);
    } else {
      // Custom date range
      startDateTime = new Date(this.startDate);
      startDateTime.setHours(0, 0, 0, 0);
      endDateTime = new Date(this.endDate);
      endDateTime.setHours(23, 59, 59, 999);
    }

    // Restart listener with new date range
    this.isLoading = true;
    this.adminService.startRealtimeListener(startDateTime, endDateTime);
  }

  /**
   * Handle date filter type change (today vs range)
   */
  onDateFilterTypeChange(type: 'today' | 'range'): void {
    this.dateFilterType = type;
    if (type === 'today') {
      // Reset to today
      this.initializeDateFilters();
    }
    this.applyDateFilter();
  }

  /**
   * Handle custom date range change
   */
  onDateRangeChange(): void {
    if (this.startDate && this.endDate) {
      this.applyDateFilter();
    }
  }
}
