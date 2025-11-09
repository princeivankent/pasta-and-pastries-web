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
  selectedProduct: Product | null = null;

  openModal(): void {
    this.selectedProduct = this.product;
  }

  closeModal(): void {
    this.selectedProduct = null;
  }
}
