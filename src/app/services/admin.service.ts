import { Injectable, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, getDocs, query, orderBy, onSnapshot, Unsubscribe, where, Timestamp } from '@angular/fire/firestore';
import { Observable, from, of, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Order } from '../models/order';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly ADMIN_PASSWORD = '123456789';
  private readonly ADMIN_AUTH_KEY = 'pasta-haus-admin-auth';
  private readonly ORDERS_STORAGE_KEY = 'pasta-haus-orders';
  private isBrowser: boolean;
  private firestore = inject(Firestore);
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$: Observable<Order[]> = this.ordersSubject.asObservable();
  private unsubscribeSnapshot?: Unsubscribe;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Authenticate admin with password
   */
  login(password: string): boolean {
    if (password === this.ADMIN_PASSWORD) {
      if (this.isBrowser) {
        localStorage.setItem(this.ADMIN_AUTH_KEY, 'true');
      }
      return true;
    }
    return false;
  }

  /**
   * Logout admin
   */
  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.ADMIN_AUTH_KEY);
    }
    // Unsubscribe from real-time listener
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = undefined;
    }
  }

  /**
   * Check if admin is authenticated
   */
  isAuthenticated(): boolean {
    if (!this.isBrowser) {
      return false;
    }
    return localStorage.getItem(this.ADMIN_AUTH_KEY) === 'true';
  }

  /**
   * Get all orders (admin view - not filtered by userId)
   */
  getAllOrders(startDate?: Date, endDate?: Date): Observable<Order[]> {
    if (!this.isBrowser) {
      return of([]);
    }

    if (environment.useMockData) {
      return of(this.getOrdersFromLocalStorage(startDate, endDate));
    } else {
      return this.getAllOrdersFromFirestore(startDate, endDate);
    }
  }

  /**
   * Start listening to orders in real-time (Firestore only)
   * Returns the current orders and updates via orders$ observable
   * @param startDate Optional start date for filtering (defaults to today at 00:00:00)
   * @param endDate Optional end date for filtering (defaults to today at 23:59:59)
   */
  startRealtimeListener(startDate?: Date, endDate?: Date): void {
    if (!this.isBrowser || environment.useMockData) {
      // For mock data, just load once
      this.ordersSubject.next(this.getOrdersFromLocalStorage(startDate, endDate));
      return;
    }

    // Unsubscribe from previous listener if exists
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
    }

    // Default to today if no dates provided
    if (!startDate) {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
    }
    if (!endDate) {
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    const ordersCollection = collection(this.firestore, 'orders');

    // Build query with date range filtering
    const startTimestamp = Timestamp.fromDate(startDate);
    const endTimestamp = Timestamp.fromDate(endDate);

    const ordersQuery = query(
      ordersCollection,
      where('orderDate', '>=', startTimestamp),
      where('orderDate', '<=', endTimestamp),
      orderBy('orderDate', 'desc')
    );

    this.unsubscribeSnapshot = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const orders = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            orderDate: data['orderDate']?.toDate() || new Date()
          } as Order;
        });
        this.ordersSubject.next(orders);
      },
      (error) => {
        console.error('Error in real-time orders listener:', error);
      }
    );
  }

  /**
   * Stop listening to real-time updates
   */
  stopRealtimeListener(): void {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = undefined;
    }
  }

  // ============= FIRESTORE METHODS =============

  private getAllOrdersFromFirestore(startDate?: Date, endDate?: Date): Observable<Order[]> {
    const ordersCollection = collection(this.firestore, 'orders');

    let ordersQuery;

    if (startDate && endDate) {
      // Build query with date range filtering
      const startTimestamp = Timestamp.fromDate(startDate);
      const endTimestamp = Timestamp.fromDate(endDate);

      ordersQuery = query(
        ordersCollection,
        where('orderDate', '>=', startTimestamp),
        where('orderDate', '<=', endTimestamp),
        orderBy('orderDate', 'desc')
      );
    } else {
      ordersQuery = query(ordersCollection, orderBy('orderDate', 'desc'));
    }

    return from(getDocs(ordersQuery)).pipe(
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
        console.error('Error fetching all orders from Firestore:', error);
        return of([]);
      })
    );
  }

  // ============= LOCAL STORAGE METHODS =============

  private getOrdersFromLocalStorage(startDate?: Date, endDate?: Date): Order[] {
    if (!this.isBrowser) {
      return [];
    }

    const ordersData = localStorage.getItem(this.ORDERS_STORAGE_KEY);
    if (!ordersData) {
      return [];
    }

    const orders = JSON.parse(ordersData);
    // Convert date strings back to Date objects
    let filteredOrders = orders.map((order: any) => ({
      ...order,
      orderDate: new Date(order.orderDate)
    }));

    // Apply date filtering if provided
    if (startDate && endDate) {
      filteredOrders = filteredOrders.filter((order: Order) => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    return filteredOrders.sort((a: Order, b: Order) => b.orderDate.getTime() - a.orderDate.getTime());
  }
}
