import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product, ProductVariant, ProductStatus } from '../../models/product';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-product-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-modal.component.html',
  styleUrl: './product-modal.component.scss'
})
export class ProductModalComponent {
  @Input() product: Product | null = null;
  @Output() closeModal = new EventEmitter<void>();

  quantity: number = 1;
  specialInstructions: string = '';
  isAdding: boolean = false;
  justAdded: boolean = false;
  selectedVariant: ProductVariant | null = null;

  constructor(
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  close(): void {
    this.closeModal.emit();
    this.resetForm();
  }

  addToCart(): void {
    if (this.product && !this.isAdding && this.canAddToCart()) {
      this.isAdding = true;
      this.cartService.addToCart(this.product, this.quantity, this.specialInstructions, this.selectedVariant || undefined);

      // Show success state
      this.justAdded = true;

      // Show toast notification
      const quantityText = this.quantity > 1 ? `${this.quantity}x ` : '';
      const variantText = this.selectedVariant ? ` (${this.selectedVariant.label})` : '';
      this.toastService.success(`${quantityText}${this.product.name}${variantText} added to cart!`);

      // Close modal after brief delay to show success state
      setTimeout(() => {
        this.isAdding = false;
        this.justAdded = false;
        this.close();
      }, 800);
    }
  }

  incrementQuantity(): void {
    this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  private resetForm(): void {
    this.quantity = 1;
    this.specialInstructions = '';
    this.selectedVariant = null;
  }

  hasVariants(): boolean {
    return !!(this.product?.variants && this.product.variants.length > 0);
  }

  selectVariant(variant: ProductVariant): void {
    this.selectedVariant = variant;
  }

  getCurrentPrice(): number {
    if (this.selectedVariant) {
      return this.selectedVariant.price;
    }
    return this.product?.price || 0;
  }

  canAddToCart(): boolean {
    if (!this.product) return false;

    // Check if product is available
    if (!this.isProductAvailable()) return false;

    // If product has variants, a variant must be selected and available
    if (this.hasVariants()) {
      if (!this.selectedVariant) return false;
      if (!this.isVariantAvailable(this.selectedVariant)) return false;
    }

    return true;
  }

  isProductAvailable(): boolean {
    const status = this.product?.status || 'available';
    return status === 'available';
  }

  isVariantAvailable(variant: ProductVariant): boolean {
    const status = variant.status || 'available';
    return status === 'available';
  }

  getProductStatusLabel(): string {
    const status = this.product?.status || 'available';
    if (status === 'sold-out') return 'Sold Out';
    if (status === 'unavailable') return 'Unavailable';
    return '';
  }

  getVariantStatusLabel(variant: ProductVariant): string {
    const status = variant.status || 'available';
    if (status === 'sold-out') return 'Sold Out';
    if (status === 'unavailable') return 'Unavailable';
    return '';
  }
}
