import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth, signInWithPopup, signOut, GoogleAuthProvider, User, user, setPersistence, browserLocalPersistence } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private platformId = inject(PLATFORM_ID);
  private googleProvider = new GoogleAuthProvider();

  // Observable of current user
  user$: Observable<User | null> = user(this.auth);

  constructor() {
    // Configure Google provider to select account on each login
    this.googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    // Set persistence to LOCAL (persists across browser sessions and page refreshes)
    if (isPlatformBrowser(this.platformId)) {
      setPersistence(this.auth, browserLocalPersistence).catch((error) => {
        console.error('Error setting auth persistence:', error);
      });
    }
  }

  /**
   * Sign in with Google using popup
   * @returns Promise with user credentials
   */
  async signInWithGoogle(): Promise<User | null> {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      console.log('Successfully signed in:', result.user);
      return result.user;
    } catch (error: any) {
      console.error('Error signing in with Google:', error);

      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Sign-in popup was closed by the user');
      } else if (error.code === 'auth/cancelled-popup-request') {
        console.log('Multiple popup requests detected');
      }

      throw error;
    }
  }

  /**
   * Sign out the current user
   * @returns Promise that resolves when sign out is complete
   */
  async signOutUser(): Promise<void> {
    try {
      await signOut(this.auth);
      console.log('Successfully signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  /**
   * Get the current user synchronously
   * @returns Current user or null
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }
}
