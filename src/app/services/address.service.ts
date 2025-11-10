import { Injectable, PLATFORM_ID, Inject, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserAddress {
  userId: string;
  address: string;
  phoneNumber?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private readonly ADDRESS_STORAGE_KEY = 'pasta-haus-user-addresses';
  private isBrowser: boolean;
  private auth = inject(Auth);

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Get the delivery address for the current user from localStorage
   */
  getUserAddress(): Observable<UserAddress | null> {
    if (!this.isBrowser) {
      return of(null);
    }

    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      return throwError(() => new Error('Please sign in to view address'));
    }

    const addresses = this.getAddressesFromLocalStorage();
    const userAddress = addresses.find(addr => addr.userId === currentUser.uid);
    return of(userAddress || null);
  }

  /**
   * Get the default address for the current user (for backward compatibility)
   */
  getDefaultAddress(): Observable<any | null> {
    return this.getUserAddress();
  }

  /**
   * Save or update the delivery address for the current user
   */
  saveUserAddress(address: string, phoneNumber?: string): Observable<UserAddress> {
    if (!this.isBrowser) {
      return throwError(() => new Error('Cannot save addresses on server'));
    }

    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      return throwError(() => new Error('Please sign in to save an address'));
    }

    const userAddress: UserAddress = {
      userId: currentUser.uid,
      address: address.trim(),
      phoneNumber: phoneNumber?.trim()
    };

    const addresses = this.getAddressesFromLocalStorage();
    const existingIndex = addresses.findIndex(addr => addr.userId === currentUser.uid);

    if (existingIndex >= 0) {
      // Update existing address
      addresses[existingIndex] = userAddress;
    } else {
      // Add new address
      addresses.push(userAddress);
    }

    localStorage.setItem(this.ADDRESS_STORAGE_KEY, JSON.stringify(addresses));
    return of(userAddress);
  }

  /**
   * Delete the address for the current user
   */
  deleteUserAddress(): Observable<boolean> {
    if (!this.isBrowser) {
      return of(false);
    }

    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      return of(false);
    }

    const addresses = this.getAddressesFromLocalStorage();
    const filteredAddresses = addresses.filter(addr => addr.userId !== currentUser.uid);

    if (filteredAddresses.length === addresses.length) {
      return of(false); // Address not found
    }

    localStorage.setItem(this.ADDRESS_STORAGE_KEY, JSON.stringify(filteredAddresses));
    return of(true);
  }

  // Helper method to get all addresses from localStorage
  private getAddressesFromLocalStorage(): UserAddress[] {
    if (!this.isBrowser) {
      return [];
    }

    const addressesData = localStorage.getItem(this.ADDRESS_STORAGE_KEY);
    if (!addressesData) {
      return [];
    }

    try {
      return JSON.parse(addressesData);
    } catch (error) {
      console.error('Error parsing addresses from localStorage:', error);
      return [];
    }
  }

  /**
   * Legacy method for backward compatibility
   * Returns empty array since we no longer store multiple addresses
   */
  getUserAddresses(): Observable<any[]> {
    return this.getUserAddress().pipe(
      map(userAddress => userAddress ? [userAddress] : [])
    );
  }
}
