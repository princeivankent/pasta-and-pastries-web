import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product';
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

  constructor(
    private cartService: CartService,
    private toastService: ToastService
  ) {}

  close(): void {
    this.closeModal.emit();
    this.resetForm();
  }

  addToCart(): void {
    if (this.product && !this.isAdding) {
      this.isAdding = true;
      this.cartService.addToCart(this.product, this.quantity, this.specialInstructions);

      // Show success state
      this.justAdded = true;

      // Show toast notification
      const quantityText = this.quantity > 1 ? `${this.quantity}x ` : '';
      this.toastService.success(`${quantityText}${this.product.name} added to cart!`);

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
  }
}
