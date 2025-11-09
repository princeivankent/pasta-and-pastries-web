import { Injectable, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from './cart.service';
import { AuthService } from './auth.service';
import { Order } from '../models/order';
import { CartItem } from '../models/cart-item';
import { Firestore, collection, addDoc, query, where, getDocs, onSnapshot, doc, getDoc, Timestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private readonly ORDERS_STORAGE_KEY = 'pasta-haus-orders';
  private isBrowser: boolean;
  private firestore: Firestore = inject(Firestore);

  constructor(
    private cartService: CartService,
    private authService: AuthService,
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

  /**
   * Get user's orders from Firestore with real-time updates
   * Requires user authentication
   */
  getUserOrdersRealtime(): Observable<Order[]> {
    return new Observable(observer => {
      const user = this.authService.getCurrentUser();

      if (!user) {
        observer.error('User not authenticated');
        return;
      }

      const ordersCollection = collection(this.firestore, 'orders');
      const userOrdersQuery = query(ordersCollection, where('userId', '==', user.uid));

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        userOrdersQuery,
        (snapshot) => {
          const orders: Order[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              items: data['items'] || [],
              totalAmount: data['totalAmount'] || 0,
              customerName: data['customerName'],
              customerEmail: data['customerEmail'],
              customerPhone: data['customerPhone'],
              deliveryAddress: data['deliveryAddress'],
              orderType: data['orderType'] || 'pickup',
              specialInstructions: data['specialInstructions'],
              orderDate: data['orderDate']?.toDate() || new Date(),
              status: data['status'] || 'pending'
            } as Order;
          });

          // Sort by order date (newest first)
          orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
          observer.next(orders);
        },
        (error) => {
          console.error('Error listening to orders:', error);
          observer.error(error);
        }
      );

      // Return cleanup function
      return () => unsubscribe();
    });
  }

  /**
   * Get a specific order with real-time updates
   */
  getOrderRealtimeById(orderId: string): Observable<Order | null> {
    return new Observable(observer => {
      const orderDocRef = doc(this.firestore, 'orders', orderId);

      const unsubscribe = onSnapshot(
        orderDocRef,
        (docSnapshot) => {
          if (!docSnapshot.exists()) {
            observer.next(null);
            return;
          }

          const data = docSnapshot.data();
          const order: Order = {
            id: docSnapshot.id,
            items: data['items'] || [],
            totalAmount: data['totalAmount'] || 0,
            customerName: data['customerName'],
            customerEmail: data['customerEmail'],
            customerPhone: data['customerPhone'],
            deliveryAddress: data['deliveryAddress'],
            orderType: data['orderType'] || 'pickup',
            specialInstructions: data['specialInstructions'],
            orderDate: data['orderDate']?.toDate() || new Date(),
            status: data['status'] || 'pending'
          };

          observer.next(order);
        },
        (error) => {
          console.error('Error listening to order:', error);
          observer.error(error);
        }
      );

      return () => unsubscribe();
    });
  }
}
