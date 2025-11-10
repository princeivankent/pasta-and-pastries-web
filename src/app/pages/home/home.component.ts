import { Component, OnInit, OnDestroy, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { ProductsService } from '../../services/products.service';
import { TestimonialsService } from '../../services/testimonials.service';
import { SeoService } from '../../services/seo.service';
import { Product } from '../../models/product';
import { Testimonial } from '../../models/testimonial';
import { timeout, catchError, of } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ProductCardComponent],
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
  isLoadingProducts: boolean = true;

  // Swipe/Drag functionality
  isDragging: boolean = false;
  startX: number = 0;
  currentX: number = 0;
  dragOffset: number = 0;
  threshold: number = 50; // Minimum distance to trigger slide change
  wasDragged: boolean = false; // Track if user dragged to prevent click

  constructor(
    private productsService: ProductsService,
    private testimonialsService: TestimonialsService,
    private seoService: SeoService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    // Set SEO meta tags for home page
    this.seoService.updateMetaTags({
      title: 'Pasta & Pastries by Cha - Homemade Lasagna & Freshly Baked Goodies',
      description: 'Discover delicious homemade pasta and freshly baked pastries at Pasta & Pastries by Cha. Order our famous lasagna, carbonara, and artisan pastries made with love.',
      keywords: 'homemade pasta, fresh pastries, lasagna, carbonara, bakery, restaurant, homemade food, artisan bread, Italian cuisine',
      image: '/images/lasagna.jpg',
      url: 'https://pastaandpastriesbycha.com',
      type: 'website'
    });

    // Add LocalBusiness structured data
    this.seoService.addStructuredData(this.seoService.getLocalBusinessSchema());

    // Load testimonials (synchronous, no Firestore dependency)
    this.testimonials = this.testimonialsService.getAllTestimonials();

    // Only load products from Firestore in the browser (not during SSR)
    if (isPlatformBrowser(this.platformId)) {
      // Subscribe to best sellers with timeout to prevent infinite loading
      this.productsService.getBestSellers()
        .pipe(
          timeout(10000), // 10 second timeout
          catchError((error) => {
            console.error('Error loading best sellers:', error);
            return of([]); // Return empty array on error
          })
        )
        .subscribe({
          next: (products) => {
            this.bestSellers = products;
            this.isLoadingProducts = false;
          },
          error: (error) => {
            console.error('Error loading best sellers:', error);
            this.bestSellers = [];
            this.isLoadingProducts = false;
          }
        });

      // Re-enabled auto-rotation for better UX
      this.startAutoRotate();
    } else {
      // During SSR, set loading to false and use empty products
      this.isLoadingProducts = false;
      this.bestSellers = [];
    }
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
    // Prevent modal from opening if user was dragging
    if (this.wasDragged) {
      this.wasDragged = false;
      return;
    }

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

  // Touch events for mobile
  onTouchStart(event: TouchEvent): void {
    this.startX = event.touches[0].clientX;
    this.isDragging = true;
    this.pauseAutoRotate();
  }

  onTouchMove(event: TouchEvent): void {
    if (!this.isDragging) return;
    this.currentX = event.touches[0].clientX;
    this.dragOffset = this.currentX - this.startX;
  }

  onTouchEnd(): void {
    if (!this.isDragging) return;

    // Mark as dragged if moved more than a few pixels
    if (Math.abs(this.dragOffset) > 5) {
      this.wasDragged = true;
    }

    this.handleSwipe();
    this.isDragging = false;
    this.dragOffset = 0;
    this.resumeAutoRotate();

    // Reset wasDragged after a short delay
    setTimeout(() => {
      this.wasDragged = false;
    }, 100);
  }

  // Mouse events for desktop
  onMouseDown(event: MouseEvent): void {
    this.startX = event.clientX;
    this.isDragging = true;
    this.pauseAutoRotate();
    event.preventDefault(); // Prevent text selection while dragging
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    this.currentX = event.clientX;
    this.dragOffset = this.currentX - this.startX;
  }

  onMouseUp(): void {
    if (!this.isDragging) return;

    // Mark as dragged if moved more than a few pixels
    if (Math.abs(this.dragOffset) > 5) {
      this.wasDragged = true;
    }

    this.handleSwipe();
    this.isDragging = false;
    this.dragOffset = 0;
    this.resumeAutoRotate();

    // Reset wasDragged after a short delay
    setTimeout(() => {
      this.wasDragged = false;
    }, 100);
  }

  onMouseLeave(): void {
    if (this.isDragging) {
      // Mark as dragged if moved more than a few pixels
      if (Math.abs(this.dragOffset) > 5) {
        this.wasDragged = true;
      }

      this.handleSwipe();
      this.isDragging = false;
      this.dragOffset = 0;
      this.resumeAutoRotate();

      // Reset wasDragged after a short delay
      setTimeout(() => {
        this.wasDragged = false;
      }, 100);
    }
  }

  // Handle swipe logic
  private handleSwipe(): void {
    if (Math.abs(this.dragOffset) > this.threshold) {
      if (this.dragOffset > 0) {
        // Swiped right - go to previous slide
        this.prevSlide();
      } else {
        // Swiped left - go to next slide
        this.nextSlide();
      }
    }
  }

  // Get the transform style for the carousel
  getCarouselTransform(): string {
    const baseOffset = this.currentSlide * 100;
    const dragPercentage = this.isDragging ? (this.dragOffset / window.innerWidth) * 100 : 0;
    return `translateX(-${baseOffset - dragPercentage}%)`;
  }

  // Navigate to menu with smooth scroll to top
  navigateToMenu(): void {
    this.router.navigate(['/menu']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Navigate to about page with smooth scroll to top
  navigateToAbout(): void {
    this.router.navigate(['/about']).then(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
