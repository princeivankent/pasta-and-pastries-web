import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from './cart.service';
import { Order } from '../models/order';
import { CartItem } from '../models/cart-item';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private readonly ORDERS_STORAGE_KEY = 'pasta-haus-orders';
  private isBrowser: boolean;

  constructor(
    private cartService: CartService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  createOrder(
    orderType: 'pickup' | 'delivery',
    customerInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      deliveryAddress?: string;
      specialInstructions?: string;
    }
  ): Order | null {
    if (!this.isBrowser) {
      return null;
    }

    const cartItems = this.cartService.getCartItems();

    if (cartItems.length === 0) {
      return null;
    }

    const order: Order = {
      id: this.generateOrderId(),
      items: cartItems,
      totalAmount: this.cartService.getCartTotal(),
      orderType,
      customerName: customerInfo?.name,
      customerEmail: customerInfo?.email,
      customerPhone: customerInfo?.phone,
      deliveryAddress: customerInfo?.deliveryAddress,
      specialInstructions: customerInfo?.specialInstructions,
      orderDate: new Date(),
      status: 'pending'
    };

    this.saveOrder(order);
    return order;
  }

  getOrders(): Order[] {
    if (!this.isBrowser) {
      return [];
    }

    const ordersData = localStorage.getItem(this.ORDERS_STORAGE_KEY);
    if (!ordersData) {
      return [];
    }

    const orders = JSON.parse(ordersData);
    // Convert date strings back to Date objects
    return orders.map((order: any) => ({
      ...order,
      orderDate: new Date(order.orderDate)
    }));
  }

  getOrderById(orderId: string): Order | null {
    const orders = this.getOrders();
    return orders.find(order => order.id === orderId) || null;
  }

  updateOrderStatus(orderId: string, status: Order['status']): boolean {
    if (!this.isBrowser) {
      return false;
    }

    const orders = this.getOrders();
    const orderIndex = orders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
      return false;
    }

    orders[orderIndex].status = status;
    localStorage.setItem(this.ORDERS_STORAGE_KEY, JSON.stringify(orders));
    return true;
  }

  private saveOrder(order: Order): void {
    if (!this.isBrowser) {
      return;
    }

    const orders = this.getOrders();
    orders.push(order);
    localStorage.setItem(this.ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }

  private generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `ORDER-${timestamp}-${random}`.toUpperCase();
  }
}
