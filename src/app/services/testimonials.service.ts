import { Injectable } from '@angular/core';
import { Testimonial } from '../models/testimonial';

@Injectable({
  providedIn: 'root'
})
export class TestimonialsService {
  private testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Maria Santos',
      text: 'The best lasagna in town!',
      rating: 5,
      date: new Date('2024-10-15')
    },
    {
      id: 2,
      name: 'Juan Dela Cruz',
      text: 'Amazing pastries! The banana muffins are my favorite. Always fresh and delicious.',
      rating: 5,
      date: new Date('2024-10-20')
    },
    {
      id: 3,
      name: 'Sarah Johnson',
      text: 'A hidden gem! The homemade pasta tastes like my grandmother used to make. Will definitely come back!',
      rating: 5,
      date: new Date('2024-10-25')
    },
    {
      id: 4,
      name: 'Carlos Rivera',
      text: 'Great family business with authentic flavors. The crinkles are perfect with coffee.',
      rating: 4,
      date: new Date('2024-11-01')
    }
  ];

  constructor() { }

  getAllTestimonials(): Testimonial[] {
    return this.testimonials;
  }

  getLatestTestimonials(count: number = 3): Testimonial[] {
    return this.testimonials
      .sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, count);
  }
}
