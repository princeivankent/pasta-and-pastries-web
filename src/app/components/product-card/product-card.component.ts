import { Component, Input } from '@angular/core';
import { Product } from '../../models/product';
import { CommonModule } from '@angular/common';
import { ProductModalComponent } from '../product-modal/product-modal.component';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, ProductModalComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() showBestSellerBadge: boolean = false;
  selectedProduct: Product | null = null;

  openModal(): void {
    this.selectedProduct = this.product;
  }

  closeModal(): void {
    this.selectedProduct = null;
  }

  hasVariants(): boolean {
    return !!(this.product.variants && this.product.variants.length > 0);
  }

  getMinPrice(): number {
    if (!this.hasVariants()) {
      return this.product.price;
    }
    return Math.min(...this.product.variants!.map(v => v.price));
  }

  getMaxPrice(): number {
    if (!this.hasVariants()) {
      return this.product.price;
    }
    return Math.max(...this.product.variants!.map(v => v.price));
  }
}
