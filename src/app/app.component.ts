import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { ToastComponent } from './components/toast/toast.component';
import { environment } from '../environments/environment';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'pasta-and-pastries-web';
  isAdminRoute = false;

  constructor(private router: Router) {
    console.log(`Is Production: ${environment.production}`);
    console.log(`Is mock data: ${environment.useMockData}`);

    // Listen to route changes and check if we're on an admin route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isAdminRoute = event.url.startsWith('/admin');
      });

    // Check initial route
    this.isAdminRoute = this.router.url.startsWith('/admin');
  }
}
