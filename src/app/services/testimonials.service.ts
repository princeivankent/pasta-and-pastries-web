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
      text: 'Di po kami nagkamali ng pina-giveaway, thank you ulit mam!',
      rating: 5,
      photo: 'testimonials/1.jpg',
      date: new Date('2024-10-15')
    },
    {
      id: 2,
      name: 'Juan Dela Cruz',
      text: 'sarap po, sa uulitin ulet hehe',
      rating: 5,
      photo: 'testimonials/2.jpg',
      date: new Date('2024-10-20')
    },
    {
      id: 3,
      name: 'Sarah Johnson',
      text: 'Ay maam ansarap po ng luto nyo. Mas masarap pa po sa greenwich. Salamat din po!',
      rating: 5,
      photo: 'testimonials/3.jpg',
      date: new Date('2024-10-25')
    },
    {
      id: 4,
      name: 'Angie Mariano',
      text: 'Ang sarap ng muffin di gaano matamis',
      rating: 4,
      photo: 'testimonials/5.jpg',
      date: new Date('2024-11-01')
    },
    {
      id: 5,
      name: 'Bela Dela Cruz',
      text: 'Masarap po mam oorder pa nga po sana ako kaso baka wala na po eh baka soldout na po hehe sa wed or thursday po pwede po umorder ulit po?',
      rating: 5,
      photo: 'testimonials/6.jpg',
      date: new Date('2024-11-01')
    },
    {
      id: 6,
      name: 'Weng De Castro',
      text: 'Medyo nabitin po',
      rating: 6,
      photo: 'testimonials/7.jpg',
      date: new Date('2024-11-01')
    },
    {
      id: 7,
      name: 'Anita Feng',
      text: 'Hindi ako expret sa pagkaen sis. Pero masarap sya. Hindi sya sobrang tamis na nakakatusing. Saka hindi nakakaumay.. busog agad sa isa pa lang.. And my twist ha. Hindi sya buong banana muffin. Meron pang chocolate cake sa itaas',
      rating: 7,
      photo: 'testimonials/8.jpg',
      date: new Date('2024-11-01')
    },
    {
      id: 8,
      name: 'Bernardo Umali',
      text: 'Natikman ko na gawa mo, Hindi sayang pera. Kaya bibili talaga ako hehe',
      rating: 8,
      photo: 'testimonials/9.jpg',
      date: new Date('2024-11-01')
    },
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
