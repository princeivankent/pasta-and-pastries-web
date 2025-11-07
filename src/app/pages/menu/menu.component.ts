import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductsService } from '../../services/products.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-menu',
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss'
})
export class MenuComponent implements OnInit {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  selectedCategory: 'all' | 'pasta' | 'pastry' = 'all';

  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.allProducts = this.productsService.getAllProducts();
    this.filteredProducts = this.allProducts;
  }

  filterByCategory(category: 'all' | 'pasta' | 'pastry'): void {
    this.selectedCategory = category;
    if (category === 'all') {
      this.filteredProducts = this.allProducts;
    } else {
      this.filteredProducts = this.productsService.getProductsByCategory(category);
    }
  }
}
