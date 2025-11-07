import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductsService } from '../../services/products.service';
import { TestimonialsService } from '../../services/testimonials.service';
import { Product } from '../../models/product';
import { Testimonial } from '../../models/testimonial';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, ProductCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  bestSellers: Product[] = [];
  testimonials: Testimonial[] = [];

  constructor(
    private productsService: ProductsService,
    private testimonialsService: TestimonialsService
  ) {}

  ngOnInit(): void {
    this.bestSellers = this.productsService.getBestSellers();
    this.testimonials = this.testimonialsService.getLatestTestimonials(3);
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}
