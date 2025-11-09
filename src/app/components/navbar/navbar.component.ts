import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address.service';
import { ToastService } from '../../services/toast.service';
import { CartItem } from '../../models/cart-item';
import { User } from '@angular/fire/auth';
import { AddressDialogComponent } from '../address-dialog/address-dialog.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule, AddressDialogComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isCartOpen = false;
  cartItems: CartItem[] = [];
  cartCount = 0;
  cartTotal = 0;
  cartBadgePulse = false;
  currentUser: User | null = null;
  isUserMenuOpen = false;
  isAddressDialogOpen = false;
  showWelcomeAddressDialog = false;
  private cartCheckInterval: any;
  private isBrowser: boolean;
  private previousCartCount = 0;

  constructor(
    public cartService: CartService,
    public checkoutService: CheckoutService,
    public authService: AuthService,
    private addressService: AddressService,
    private toastService: ToastService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.updateCart();
    // Subscribe to auth state changes
    this.authService.user$.subscribe(user => {
      this.currentUser = user;
    });
    // Check for cart updates every second - only in browser
    if (this.isBrowser) {
      this.cartCheckInterval = setInterval(() => {
        this.updateCart();
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    if (this.cartCheckInterval) {
      clearInterval(this.cartCheckInterval);
    }
  }

  updateCart(): void {
    this.cartItems = this.cartService.getCartItems();
    const newCartCount = this.cartService.getCartCount();
    this.cartTotal = this.cartService.getCartTotal();

    // Trigger animation when cart count increases
    if (newCartCount > this.previousCartCount) {
      this.triggerCartBadgeAnimation();
    }

    this.previousCartCount = this.cartCount;
    this.cartCount = newCartCount;
  }

  private triggerCartBadgeAnimation(): void {
    this.cartBadgePulse = true;
    setTimeout(() => {
      this.cartBadgePulse = false;
    }, 600);
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      this.isCartOpen = false;
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  toggleCart() {
    this.isCartOpen = !this.isCartOpen;
    if (this.isCartOpen) {
      this.isMobileMenuOpen = false;
      this.updateCart();
    }
  }

  closeCart() {
    this.isCartOpen = false;
  }

  removeItem(index: number): void {
    this.cartService.removeFromCart(index);
    this.updateCart();
  }

  incrementQuantity(index: number): void {
    const item = this.cartItems[index];
    if (item) {
      this.cartService.updateQuantity(index, item.quantity + 1);
      this.updateCart();
    }
  }

  decrementQuantity(index: number): void {
    const item = this.cartItems[index];
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(index, item.quantity - 1);
      this.updateCart();
    }
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.updateCart();
  }

  proceedToCheckout(): void {
    // Check if user is authenticated before proceeding
    if (!this.currentUser) {
      const shouldSignIn = confirm('Please sign in to place your order.\n\nWould you like to sign in now?');
      if (shouldSignIn) {
        this.signIn();
      }
      return;
    }

    // Get user's default address and create order
    this.addressService.getDefaultAddress().subscribe({
      next: (defaultAddress) => {
        // Check if user has a default address
        if (!defaultAddress) {
          // No default address - prompt user to add one
          this.toastService.warning('Please add a delivery address to proceed with your order.', 4000);
          this.closeCart();
          this.isAddressDialogOpen = true;
          this.showWelcomeAddressDialog = false;
          return;
        }

        // Prepare customer info with address
        const customerInfo: any = {
          name: this.currentUser?.displayName || undefined,
          email: this.currentUser?.email || undefined
        };

        // Build full address string
        const fullAddress = [
          defaultAddress.street,
          defaultAddress.barangay,
          defaultAddress.city,
          defaultAddress.province,
          defaultAddress.postalCode,
          defaultAddress.country
        ].filter(Boolean).join(', ');

        customerInfo.deliveryAddress = fullAddress;
        customerInfo.phone = defaultAddress.phoneNumber;

        // Default order type is 'delivery'
        const orderType = 'delivery';

        // Create the order
        this.checkoutService.createOrder(orderType, customerInfo).subscribe({
          next: (order) => {
            this.toastService.success(`Order created successfully! Order #${order.id.substring(0, 8)}... (Delivery) - Total: ₱${order.totalAmount.toFixed(2)}`, 5000);
            this.cartService.clearCart();
            this.updateCart();
            this.closeCart();
            // Navigate to orders page
            this.router.navigate(['/orders']);
          },
          error: (error) => {
            console.error('Error creating order:', error);
            this.toastService.error(`Failed to create order: ${error.message}. Please try again.`, 5000);
          }
        });
      },
      error: (error) => {
        console.log('Could not fetch address:', error);
        // If address fetch fails, prompt user to add address
        this.toastService.warning('Please add a delivery address to proceed with your order.', 4000);
        this.closeCart();
        this.isAddressDialogOpen = true;
        this.showWelcomeAddressDialog = false;
      }
    });
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  async signIn(): Promise<void> {
    try {
      const user = await this.authService.signInWithGoogle();
      this.closeUserMenu();

      // Check if user has any addresses, if not show welcome dialog
      if (user) {
        this.addressService.getUserAddresses().subscribe({
          next: (addresses) => {
            if (addresses.length === 0) {
              // New user, show welcome address dialog
              this.showWelcomeAddressDialog = true;
              this.isAddressDialogOpen = true;
            }
          },
          error: (error) => {
            console.log('Could not check user addresses:', error);
            // Show welcome dialog anyway for new users
            this.showWelcomeAddressDialog = true;
            this.isAddressDialogOpen = true;
          }
        });
      }
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  }

  closeAddressDialog(): void {
    this.isAddressDialogOpen = false;
    this.showWelcomeAddressDialog = false;
  }

  onAddressSaved(): void {
    console.log('Address saved successfully!');
    this.closeAddressDialog();
  }

  async signOut(): Promise<void> {
    // Show confirmation dialog
    const confirmed = confirm('Are you sure you want to sign out?');
    if (!confirmed) {
      return;
    }

    try {
      await this.authService.signOutUser();
      this.closeUserMenu();
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  }
}
