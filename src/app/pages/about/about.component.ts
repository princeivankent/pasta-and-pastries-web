import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    // Set SEO meta tags for about page
    this.seoService.updateMetaTags({
      title: 'About Us - Pasta & Pastries by Cha',
      description: 'Learn about Pasta & Pastries by Cha - our story, passion for homemade food, and commitment to quality ingredients. Family recipes made with love since day one.',
      keywords: 'about, our story, homemade food, family recipes, quality ingredients, passion for cooking, artisan bakery',
      image: '/images/lasagna.jpg',
      url: 'https://pastaandpastriesbycha.com/about',
      type: 'website'
    });
  }
}
