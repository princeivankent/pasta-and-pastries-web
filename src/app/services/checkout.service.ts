import { Injectable, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, addDoc, doc, getDoc, getDocs, updateDoc, query, where, Timestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { CartService } from './cart.service';
import { Order } from '../models/order';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private readonly ORDERS_STORAGE_KEY = 'pasta-haus-orders';
  private isBrowser: boolean;
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  constructor(
    private cartService: CartService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Create a new order - requires authentication in production
   * Returns Observable with the created order
   */
  createOrder(
    orderType: 'pickup' | 'delivery',
    customerInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      deliveryAddress?: string;
      specialInstructions?: string;
    }
  ): Observable<Order> {
    if (!this.isBrowser) {
      return throwError(() => new Error('Cannot create orders on server'));
    }

    const cartItems = this.cartService.getCartItems();

    if (cartItems.length === 0) {
      return throwError(() => new Error('Cart is empty'));
    }

    // Check authentication - ALWAYS required (both dev and production)
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      return throwError(() => new Error('Please sign in to place your order'));
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
      status: 'pending',
      userId: currentUser?.uid
    };

    // Use Firestore in production, localStorage in development
    if (environment.useMockData) {
      this.saveOrderToLocalStorage(order);
      return of(order);
    } else {
      return this.saveOrderToFirestore(order);
    }
  }

  /**
   * Get all orders for the current user
   */
  getOrders(): Observable<Order[]> {
    if (!this.isBrowser) {
      return of([]);
    }

    // Check authentication - ALWAYS required
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      return throwError(() => new Error('Please sign in to view your orders'));
    }

    if (environment.useMockData) {
      // In development mode, filter by userId as well
      const allOrders = this.getOrdersFromLocalStorage();
      return of(allOrders.filter(order => order.userId === currentUser.uid));
    } else {
      return this.getOrdersFromFirestore(currentUser.uid);
    }
  }

  /**
   * Get a specific order by ID
   */
  getOrderById(orderId: string): Observable<Order | null> {
    if (!this.isBrowser) {
      return of(null);
    }

    if (environment.useMockData) {
      const orders = this.getOrdersFromLocalStorage();
      return of(orders.find(order => order.id === orderId) || null);
    } else {
      return this.getOrderByIdFromFirestore(orderId);
    }
  }

  /**
   * Update order status
   */
  updateOrderStatus(orderId: string, status: Order['status']): Observable<boolean> {
    if (!this.isBrowser) {
      return of(false);
    }

    if (environment.useMockData) {
      return of(this.updateOrderStatusInLocalStorage(orderId, status));
    } else {
      return this.updateOrderStatusInFirestore(orderId, status);
    }
  }

  // ============= FIRESTORE METHODS =============

  private saveOrderToFirestore(order: Order): Observable<Order> {
    const ordersCollection = collection(this.firestore, 'orders');

    // Convert Date to Firestore Timestamp and remove undefined fields
    const orderData: any = {
      items: order.items,
      totalAmount: order.totalAmount,
      orderType: order.orderType,
      orderDate: Timestamp.fromDate(order.orderDate),
      status: order.status,
      userId: order.userId
    };

    // Only add optional fields if they have values
    if (order.customerName) orderData.customerName = order.customerName;
    if (order.customerEmail) orderData.customerEmail = order.customerEmail;
    if (order.customerPhone) orderData.customerPhone = order.customerPhone;
    if (order.deliveryAddress) orderData.deliveryAddress = order.deliveryAddress;
    if (order.specialInstructions) orderData.specialInstructions = order.specialInstructions;

    return from(addDoc(ordersCollection, orderData)).pipe(
      map((docRef) => {
        return { ...order, id: docRef.id };
      }),
      catchError(error => {
        console.error('Error saving order to Firestore:', error);
        return throwError(() => new Error('Failed to create order. Please try again.'));
      })
    );
  }

  private getOrdersFromFirestore(userId: string): Observable<Order[]> {
    const ordersCollection = collection(this.firestore, 'orders');
    const userOrdersQuery = query(ordersCollection, where('userId', '==', userId));

    return from(getDocs(userOrdersQuery)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            orderDate: data['orderDate']?.toDate() || new Date()
          } as Order;
        });
      }),
      catchError(error => {
        console.error('Error fetching orders from Firestore:', error);
        return of([]);
      })
    );
  }

  private getOrderByIdFromFirestore(orderId: string): Observable<Order | null> {
    const orderDoc = doc(this.firestore, `orders/${orderId}`);

    return from(getDoc(orderDoc)).pipe(
      map(docSnap => {
        if (!docSnap.exists()) {
          return null;
        }
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          orderDate: data['orderDate']?.toDate() || new Date()
        } as Order;
      }),
      catchError(error => {
        console.error(`Error fetching order ${orderId} from Firestore:`, error);
        return of(null);
      })
    );
  }

  private updateOrderStatusInFirestore(orderId: string, status: Order['status']): Observable<boolean> {
    const orderDoc = doc(this.firestore, `orders/${orderId}`);

    return from(updateDoc(orderDoc, { status })).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error updating order ${orderId} status in Firestore:`, error);
        return of(false);
      })
    );
  }

  // ============= LOCAL STORAGE METHODS =============

  private getOrdersFromLocalStorage(): Order[] {
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

  private saveOrderToLocalStorage(order: Order): void {
    if (!this.isBrowser) {
      return;
    }

    const orders = this.getOrdersFromLocalStorage();
    orders.push(order);
    localStorage.setItem(this.ORDERS_STORAGE_KEY, JSON.stringify(orders));
  }

  private updateOrderStatusInLocalStorage(orderId: string, status: Order['status']): boolean {
    if (!this.isBrowser) {
      return false;
    }

    const orders = this.getOrdersFromLocalStorage();
    const orderIndex = orders.findIndex(order => order.id === orderId);

    if (orderIndex === -1) {
      return false;
    }

    orders[orderIndex].status = status;
    localStorage.setItem(this.ORDERS_STORAGE_KEY, JSON.stringify(orders));
    return true;
  }

  private generateOrderId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `ORDER-${timestamp}-${random}`.toUpperCase();
  }
}
