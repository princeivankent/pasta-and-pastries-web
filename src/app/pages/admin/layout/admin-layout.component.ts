import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent {
  activeTab: 'products' | 'orders' = 'orders';

  constructor(
    private adminService: AdminService,
    private toastService: ToastService,
    private router: Router
  ) {
    // Determine active tab based on current route
    const currentUrl = this.router.url;
    if (currentUrl.includes('products')) {
      this.activeTab = 'products';
    } else {
      this.activeTab = 'orders';
    }
  }

  setActiveTab(tab: 'products' | 'orders'): void {
    this.activeTab = tab;
    if (tab === 'products') {
      this.router.navigate(['/admin/products']);
    } else {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  logout(): void {
    this.adminService.logout();
    this.toastService.success('Logged out successfully');
    this.router.navigate(['/admin/login']);
  }
}
