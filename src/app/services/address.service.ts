import { Injectable, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, addDoc, doc, getDoc, getDocs, updateDoc, deleteDoc, query, where, Timestamp, orderBy } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Address } from '../models/address';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private readonly ADDRESSES_STORAGE_KEY = 'pasta-haus-addresses';
  private isBrowser: boolean;
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Get all addresses for the current user
   */
  getUserAddresses(): Observable<Address[]> {
    if (!this.isBrowser) {
      return of([]);
    }

    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      return throwError(() => new Error('Please sign in to view addresses'));
    }

    if (environment.useMockData) {
      const addresses = this.getAddressesFromLocalStorage();
      return of(addresses.filter(addr => addr.userId === currentUser.uid));
    } else {
      return this.getAddressesFromFirestore(currentUser.uid);
    }
  }

  /**
   * Get the default address for the current user
   */
  getDefaultAddress(): Observable<Address | null> {
    return this.getUserAddresses().pipe(
      map(addresses => {
        const defaultAddr = addresses.find(addr => addr.isDefault);
        return defaultAddr || (addresses.length > 0 ? addresses[0] : null);
      }),
      catchError(() => of(null))
    );
  }

  /**
   * Add a new address for the current user
   */
  addAddress(addressData: Omit<Address, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Observable<Address> {
    if (!this.isBrowser) {
      return throwError(() => new Error('Cannot add addresses on server'));
    }

    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      return throwError(() => new Error('Please sign in to add an address'));
    }

    const address: Address = {
      ...addressData,
      userId: currentUser.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    if (environment.useMockData) {
      address.id = this.generateAddressId();
      this.saveAddressToLocalStorage(address);
      return of(address);
    } else {
      return this.saveAddressToFirestore(address);
    }
  }

  /**
   * Update an existing address
   */
  updateAddress(addressId: string, updates: Partial<Address>): Observable<boolean> {
    if (!this.isBrowser) {
      return of(false);
    }

    if (environment.useMockData) {
      return of(this.updateAddressInLocalStorage(addressId, updates));
    } else {
      return this.updateAddressInFirestore(addressId, updates);
    }
  }

  /**
   * Delete an address
   */
  deleteAddress(addressId: string): Observable<boolean> {
    if (!this.isBrowser) {
      return of(false);
    }

    if (environment.useMockData) {
      return of(this.deleteAddressFromLocalStorage(addressId));
    } else {
      return this.deleteAddressFromFirestore(addressId);
    }
  }

  /**
   * Set an address as default (and unset others)
   */
  setDefaultAddress(addressId: string): Observable<boolean> {
    if (!this.isBrowser) {
      return of(false);
    }

    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      return throwError(() => new Error('Please sign in'));
    }

    if (environment.useMockData) {
      return of(this.setDefaultAddressInLocalStorage(addressId, currentUser.uid));
    } else {
      return this.setDefaultAddressInFirestore(addressId, currentUser.uid);
    }
  }

  // ============= FIRESTORE METHODS =============

  private saveAddressToFirestore(address: Address): Observable<Address> {
    const addressesCollection = collection(this.firestore, 'addresses');

    // Convert Date to Firestore Timestamp and remove undefined fields
    const addressData: any = {
      userId: address.userId,
      street: address.street,
      city: address.city,
      province: address.province,
      country: address.country,
      isDefault: address.isDefault,
      createdAt: Timestamp.fromDate(address.createdAt),
      updatedAt: Timestamp.fromDate(address.updatedAt)
    };

    // Only add optional fields if they have values
    if (address.barangay) addressData.barangay = address.barangay;
    if (address.postalCode) addressData.postalCode = address.postalCode;
    if (address.phoneNumber) addressData.phoneNumber = address.phoneNumber;
    if (address.label) addressData.label = address.label;

    return from(addDoc(addressesCollection, addressData)).pipe(
      map((docRef) => {
        return { ...address, id: docRef.id };
      }),
      catchError(error => {
        console.error('Error saving address to Firestore:', error);
        return throwError(() => new Error('Failed to save address. Please try again.'));
      })
    );
  }

  private getAddressesFromFirestore(userId: string): Observable<Address[]> {
    const addressesCollection = collection(this.firestore, 'addresses');
    const userAddressesQuery = query(
      addressesCollection,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    return from(getDocs(userAddressesQuery)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data['createdAt']?.toDate() || new Date(),
            updatedAt: data['updatedAt']?.toDate() || new Date()
          } as Address;
        });
      }),
      catchError(error => {
        console.error('Error fetching addresses from Firestore:', error);
        return of([]);
      })
    );
  }

  private updateAddressInFirestore(addressId: string, updates: Partial<Address>): Observable<boolean> {
    const addressDoc = doc(this.firestore, `addresses/${addressId}`);

    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date())
    };

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    return from(updateDoc(addressDoc, updateData)).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error updating address ${addressId} in Firestore:`, error);
        return of(false);
      })
    );
  }

  private deleteAddressFromFirestore(addressId: string): Observable<boolean> {
    const addressDoc = doc(this.firestore, `addresses/${addressId}`);

    return from(deleteDoc(addressDoc)).pipe(
      map(() => true),
      catchError(error => {
        console.error(`Error deleting address ${addressId} from Firestore:`, error);
        return of(false);
      })
    );
  }

  private setDefaultAddressInFirestore(addressId: string, userId: string): Observable<boolean> {
    // First, get all user addresses and unset isDefault
    const addressesCollection = collection(this.firestore, 'addresses');
    const userAddressesQuery = query(addressesCollection, where('userId', '==', userId));

    return from(getDocs(userAddressesQuery)).pipe(
      map(async (snapshot) => {
        const batch: Promise<void>[] = [];

        snapshot.docs.forEach(docSnap => {
          const addressDoc = doc(this.firestore, `addresses/${docSnap.id}`);
          const isDefault = docSnap.id === addressId;
          batch.push(updateDoc(addressDoc, { isDefault, updatedAt: Timestamp.fromDate(new Date()) }));
        });

        await Promise.all(batch);
        return true;
      }),
      catchError(error => {
        console.error('Error setting default address in Firestore:', error);
        return of(false);
      }),
      map(result => result as boolean)
    );
  }

  // ============= LOCAL STORAGE METHODS =============

  private getAddressesFromLocalStorage(): Address[] {
    if (!this.isBrowser) {
      return [];
    }

    const addressesData = localStorage.getItem(this.ADDRESSES_STORAGE_KEY);
    if (!addressesData) {
      return [];
    }

    const addresses = JSON.parse(addressesData);
    // Convert date strings back to Date objects
    return addresses.map((addr: any) => ({
      ...addr,
      createdAt: new Date(addr.createdAt),
      updatedAt: new Date(addr.updatedAt)
    }));
  }

  private saveAddressToLocalStorage(address: Address): void {
    if (!this.isBrowser) {
      return;
    }

    const addresses = this.getAddressesFromLocalStorage();
    addresses.push(address);
    localStorage.setItem(this.ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
  }

  private updateAddressInLocalStorage(addressId: string, updates: Partial<Address>): boolean {
    if (!this.isBrowser) {
      return false;
    }

    const addresses = this.getAddressesFromLocalStorage();
    const addressIndex = addresses.findIndex(addr => addr.id === addressId);

    if (addressIndex === -1) {
      return false;
    }

    addresses[addressIndex] = {
      ...addresses[addressIndex],
      ...updates,
      updatedAt: new Date()
    };

    localStorage.setItem(this.ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
    return true;
  }

  private deleteAddressFromLocalStorage(addressId: string): boolean {
    if (!this.isBrowser) {
      return false;
    }

    const addresses = this.getAddressesFromLocalStorage();
    const filteredAddresses = addresses.filter(addr => addr.id !== addressId);

    if (filteredAddresses.length === addresses.length) {
      return false; // Address not found
    }

    localStorage.setItem(this.ADDRESSES_STORAGE_KEY, JSON.stringify(filteredAddresses));
    return true;
  }

  private setDefaultAddressInLocalStorage(addressId: string, userId: string): boolean {
    if (!this.isBrowser) {
      return false;
    }

    const addresses = this.getAddressesFromLocalStorage();
    const userAddresses = addresses.filter(addr => addr.userId === userId);

    if (!userAddresses.find(addr => addr.id === addressId)) {
      return false; // Address not found for this user
    }

    // Update all addresses
    const updatedAddresses = addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === addressId && addr.userId === userId,
      updatedAt: new Date()
    }));

    localStorage.setItem(this.ADDRESSES_STORAGE_KEY, JSON.stringify(updatedAddresses));
    return true;
  }

  private generateAddressId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    return `ADDR-${timestamp}-${random}`.toUpperCase();
  }
}
