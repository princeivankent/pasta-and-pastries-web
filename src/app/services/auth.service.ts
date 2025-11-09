import { Injectable, inject } from '@angular/core';
import { Auth, signInWithPopup, signOut, GoogleAuthProvider, User, user } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private googleProvider = new GoogleAuthProvider();

  // Observable of current user
  user$: Observable<User | null> = user(this.auth);

  constructor() {
    // Configure Google provider to select account on each login
    this.googleProvider.setCustomParameters({
      prompt: 'select_account'
    });
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
