import { Component, OnInit, OnDestroy } from '@angular/core';
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
export class HomeComponent implements OnInit, OnDestroy {
  bestSellers: Product[] = [];
  testimonials: Testimonial[] = [];
  currentSlide: number = 0;
  private autoRotateInterval: any;
  isAutoRotating: boolean = true;
  selectedImageUrl: string = '';
  selectedImageName: string = '';

  constructor(
    private productsService: ProductsService,
    private testimonialsService: TestimonialsService
  ) {}

  ngOnInit(): void {
    this.bestSellers = this.productsService.getBestSellers();
    this.testimonials = this.testimonialsService.getAllTestimonials();
    // Temporarily disabled auto-rotation - can be re-enabled later
    // this.startAutoRotate();
  }

  ngOnDestroy(): void {
    this.stopAutoRotate();
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.testimonials.length;
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0
      ? this.testimonials.length - 1
      : this.currentSlide - 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  startAutoRotate(): void {
    this.stopAutoRotate();
    this.autoRotateInterval = setInterval(() => {
      if (this.isAutoRotating) {
        this.nextSlide();
      }
    }, 5000); // Rotate every 5 seconds
  }

  stopAutoRotate(): void {
    if (this.autoRotateInterval) {
      clearInterval(this.autoRotateInterval);
    }
  }

  pauseAutoRotate(): void {
    this.isAutoRotating = false;
  }

  resumeAutoRotate(): void {
    this.isAutoRotating = true;
  }

  openImageModal(imageUrl: string, name: string): void {
    this.selectedImageUrl = imageUrl;
    this.selectedImageName = name;
    const modal = document.getElementById('testimonial_image_modal') as HTMLDialogElement;
    if (modal) {
      modal.showModal();
    }
  }

  closeImageModal(): void {
    const modal = document.getElementById('testimonial_image_modal') as HTMLDialogElement;
    if (modal) {
      modal.close();
    }
  }
}
