import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductsService } from '../../../services/products.service';
import { ToastService } from '../../../services/toast.service';
import { Product, ProductVariant, ProductStatus } from '../../../models/product';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.scss']
})
export class AdminProductsComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: 'all' | 'pasta' | 'pastry' = 'all';
  isLoading: boolean = true;
  expandedProductId: string | null = null;
  private productsSubscription?: Subscription;

  // Confirmation modal state
  isConfirmModalOpen: boolean = false;
  pendingChangeProduct: Product | null = null;
  pendingChangeVariant: ProductVariant | null = null;
  pendingChangeStatus: ProductStatus | null = null;

  categoryOptions = [
    { value: 'all', label: 'All Products' },
    { value: 'pasta', label: 'Pasta' },
    { value: 'pastry', label: 'Pastry' }
  ];

  statusOptions: ProductStatus[] = ['available', 'sold-out', 'unavailable'];

  constructor(
    private productsService: ProductsService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    // Subscribe to real-time product updates
    this.productsSubscription = this.productsService.getAllProductsRealtime().subscribe({
      next: (products) => {
        this.products = products;
        this.filterProducts();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.toastService.error('Failed to load products');
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
  }

  filterProducts(): void {
    if (this.selectedCategory === 'all') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(p => p.category === this.selectedCategory);
    }
  }

  onCategoryFilterChange(category: 'all' | 'pasta' | 'pastry'): void {
    this.selectedCategory = category;
    this.filterProducts();
  }

  toggleProductExpand(productId: string): void {
    this.expandedProductId = this.expandedProductId === productId ? null : productId;
  }

  isProductExpanded(productId: string): boolean {
    return this.expandedProductId === productId;
  }

  async updateProductStatus(product: Product, newStatus: ProductStatus): Promise<void> {
    try {
      await this.productsService.updateProductStatus(product.id, newStatus);
      this.toastService.success(`${product.name} status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating product status:', error);
      this.toastService.error('Failed to update product status');
    }
  }

  async updateVariantStatus(product: Product, variant: ProductVariant, newStatus: ProductStatus): Promise<void> {
    try {
      await this.productsService.updateVariantStatus(product.id, variant.id, newStatus);
      this.toastService.success(`${variant.label} variant status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating variant status:', error);
      this.toastService.error('Failed to update variant status');
    }
  }

  getStatusBadgeClass(status?: ProductStatus): string {
    const effectiveStatus = status || 'available';
    const classes: Record<ProductStatus, string> = {
      'available': 'badge-success',
      'sold-out': 'badge-warning',
      'unavailable': 'badge-error'
    };
    return classes[effectiveStatus];
  }

  getStatusLabel(status?: ProductStatus): string {
    return status || 'available';
  }

  confirmStatusChange(product: Product, status: ProductStatus, variant: ProductVariant | null): void {
    this.pendingChangeProduct = product;
    this.pendingChangeVariant = variant;
    this.pendingChangeStatus = status;
    this.isConfirmModalOpen = true;
  }

  closeConfirmModal(): void {
    this.isConfirmModalOpen = false;
    this.pendingChangeProduct = null;
    this.pendingChangeVariant = null;
    this.pendingChangeStatus = null;
  }

  async confirmAndApplyStatusChange(): Promise<void> {
    if (!this.pendingChangeProduct || !this.pendingChangeStatus) {
      return;
    }

    try {
      if (this.pendingChangeVariant) {
        // Update variant status
        await this.updateVariantStatus(
          this.pendingChangeProduct,
          this.pendingChangeVariant,
          this.pendingChangeStatus
        );
      } else {
        // Update product status
        await this.updateProductStatus(
          this.pendingChangeProduct,
          this.pendingChangeStatus
        );
      }
    } finally {
      this.closeConfirmModal();
    }
  }
}
