import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart.service';

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

  constructor(private cartService: CartService) {}

  close(): void {
    this.closeModal.emit();
    this.resetForm();
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product, this.quantity, this.specialInstructions);
      this.close();
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
