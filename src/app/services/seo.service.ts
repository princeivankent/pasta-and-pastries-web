import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private meta = inject(Meta);
  private titleService = inject(Title);
  private platformId = inject(PLATFORM_ID);

  private defaultConfig: SEOConfig = {
    title: 'Pasta & Pastries by Cha - Homemade Lasagna & Freshly Baked Goodies',
    description: 'Discover delicious homemade pasta and freshly baked pastries at Pasta & Pastries by Cha. Order our famous lasagna, carbonara, and artisan pastries made with love.',
    keywords: 'homemade pasta, fresh pastries, lasagna, carbonara, bakery, restaurant, homemade food',
    image: '/images/lasagna.jpg',
    url: 'https://pastaandpastriesbycha.com',
    type: 'website',
    author: 'Pasta & Pastries by Cha'
  };

  updateMetaTags(config: Partial<SEOConfig>): void {
    const seoConfig = { ...this.defaultConfig, ...config };

    // Update title
    this.titleService.setTitle(seoConfig.title);

    // Update or add basic meta tags
    this.meta.updateTag({ name: 'description', content: seoConfig.description });

    if (seoConfig.keywords) {
      this.meta.updateTag({ name: 'keywords', content: seoConfig.keywords });
    }

    if (seoConfig.author) {
      this.meta.updateTag({ name: 'author', content: seoConfig.author });
    }

    // Open Graph meta tags for social media
    this.meta.updateTag({ property: 'og:title', content: seoConfig.title });
    this.meta.updateTag({ property: 'og:description', content: seoConfig.description });
    this.meta.updateTag({ property: 'og:type', content: seoConfig.type || 'website' });

    if (seoConfig.url) {
      this.meta.updateTag({ property: 'og:url', content: seoConfig.url });
    }

    if (seoConfig.image) {
      const imageUrl = seoConfig.image.startsWith('http')
        ? seoConfig.image
        : `${this.defaultConfig.url}${seoConfig.image}`;
      this.meta.updateTag({ property: 'og:image', content: imageUrl });
      this.meta.updateTag({ property: 'og:image:alt', content: seoConfig.title });
    }

    this.meta.updateTag({ property: 'og:site_name', content: 'Pasta & Pastries by Cha' });
    this.meta.updateTag({ property: 'og:locale', content: 'en_US' });

    // Twitter Card meta tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: seoConfig.title });
    this.meta.updateTag({ name: 'twitter:description', content: seoConfig.description });

    if (seoConfig.image) {
      const imageUrl = seoConfig.image.startsWith('http')
        ? seoConfig.image
        : `${this.defaultConfig.url}${seoConfig.image}`;
      this.meta.updateTag({ name: 'twitter:image', content: imageUrl });
      this.meta.updateTag({ name: 'twitter:image:alt', content: seoConfig.title });
    }
  }

  addStructuredData(data: any): void {
    // Only run in browser environment (not during SSR)
    if (isPlatformBrowser(this.platformId)) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(data);

      // Remove existing structured data script if any
      const existing = document.querySelector('script[type="application/ld+json"]');
      if (existing) {
        existing.remove();
      }

      document.head.appendChild(script);
    }
  }

  getLocalBusinessSchema(): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      'name': 'Pasta & Pastries by Cha',
      'description': 'Homemade pasta and freshly baked pastries made with love',
      'image': `${this.defaultConfig.url}/images/lasagna.jpg`,
      'url': this.defaultConfig.url,
      'telephone': '+639123456789',
      'email': 'hello@pastahaus.com',
      'address': {
        '@type': 'PostalAddress',
        'streetAddress': '123 Main St',
        'addressLocality': 'Your City',
        'addressRegion': 'Your Region',
        'postalCode': '12345',
        'addressCountry': 'PH'
      },
      'geo': {
        '@type': 'GeoCoordinates',
        'latitude': '14.5995',
        'longitude': '120.9842'
      },
      'openingHoursSpecification': [
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          'opens': '09:00',
          'closes': '20:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          'dayOfWeek': ['Saturday', 'Sunday'],
          'opens': '10:00',
          'closes': '21:00'
        }
      ],
      'priceRange': '$$',
      'servesCuisine': ['Italian', 'Bakery'],
      'acceptsReservations': 'True'
    };
  }
}
