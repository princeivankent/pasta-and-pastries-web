import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../services/admin.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  password: string = '';
  isLoading: boolean = false;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private toastService: ToastService
  ) {
    // Redirect to dashboard if already authenticated
    if (this.adminService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  onSubmit(): void {
    if (!this.password) {
      this.toastService.error('Please enter a password');
      return;
    }

    this.isLoading = true;

    // Simulate a brief delay for better UX
    setTimeout(() => {
      if (this.adminService.login(this.password)) {
        this.toastService.success('Login successful!');
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.toastService.error('Invalid password');
        this.password = '';
      }
      this.isLoading = false;
    }, 500);
  }
}
