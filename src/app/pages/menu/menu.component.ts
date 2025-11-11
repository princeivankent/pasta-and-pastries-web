import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductsService } from '../../services/products.service';
import { SeoService } from '../../services/seo.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit, OnDestroy {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: 'all' | 'pasta' | 'pastry' = 'all';
  private productsSubscription?: Subscription;
  private hasLoadedOnce: boolean = false;

  constructor(
    private productsService: ProductsService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    // Set SEO meta tags for menu page
    this.seoService.updateMetaTags({
      title: 'Our Menu - Pasta & Pastries by Cha',
      description: 'Browse our delicious menu of homemade pasta and fresh pastries. From classic lasagna to gourmet carbonara, and chocolate croissants to artisan sourdough bread.',
      keywords: 'menu, pasta menu, pastries menu, lasagna, carbonara, croissants, sourdough bread, homemade pasta, fresh bakery',
      image: '/images/lasagna.jpg',
      url: 'https://pastaandpastriesbycha.com/menu',
      type: 'website'
    });

    // Subscribe to real-time product updates
    this.productsSubscription = this.productsService.getAllProductsRealtime().subscribe({
      next: (products) => {
        this.allProducts = products;
        this.hasLoadedOnce = true;
        // Re-apply filter when products update
        this.filterByCategory(this.selectedCategory);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        // Only clear products if we haven't loaded any yet
        // This prevents products from disappearing due to temporary network issues
        if (!this.hasLoadedOnce) {
          this.allProducts = [];
          this.filteredProducts = [];
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
  }

  filterByCategory(category: 'all' | 'pasta' | 'pastry'): void {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredProducts = this.allProducts;
    } else {
      // Filter from already loaded products to avoid extra Firestore reads
      this.filteredProducts = this.allProducts.filter(p => p.category === category);
    }
  }
}
