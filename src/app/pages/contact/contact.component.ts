import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-contact',
  imports: [],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
  constructor(private seoService: SeoService) {}

  ngOnInit(): void {
    // Set SEO meta tags for contact page
    this.seoService.updateMetaTags({
      title: 'Contact Us - Pasta & Pastries by Cha',
      description: 'Get in touch with Pasta & Pastries by Cha. Visit us, call, or email for orders and inquiries. Open Monday-Friday 9am-8pm, Weekends 10am-9pm.',
      keywords: 'contact, location, hours, phone, email, visit us, order, inquiries, address',
      image: '/images/lasagna.jpg',
      url: 'https://pastaandpastriesbycha.com/contact',
      type: 'website'
    });

    // Add LocalBusiness structured data with contact info
    this.seoService.addStructuredData(this.seoService.getLocalBusinessSchema());
  }
}
