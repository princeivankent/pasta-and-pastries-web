import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../services/address.service';
import { Address } from '../../models/address';

@Component({
  selector: 'app-address-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './address-dialog.component.html',
  styleUrl: './address-dialog.component.scss'
})
export class AddressDialogComponent {
  @Input() isOpen = false;
  @Input() isWelcomeDialog = false; // True for new user welcome, false for regular address management
  @Output() closeDialog = new EventEmitter<void>();
  @Output() addressSaved = new EventEmitter<Address>();

  private addressService = inject(AddressService);

  // Form data
  formData = {
    street: '',
    barangay: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'Philippines', // Default to Philippines
    phoneNumber: '',
    label: 'Home',
    isDefault: true
  };

  isSubmitting = false;
  errorMessage = '';

  /**
   * Close the dialog
   */
  close(): void {
    if (!this.isWelcomeDialog) {
      this.closeDialog.emit();
      this.resetForm();
    }
  }

  /**
   * Skip adding address (only for welcome dialog)
   */
  skip(): void {
    if (this.isWelcomeDialog) {
      this.closeDialog.emit();
      this.resetForm();
    }
  }

  /**
   * Submit the address form
   */
  onSubmit(): void {
    // Validate required fields
    if (!this.formData.street || !this.formData.city || !this.formData.province) {
      this.errorMessage = 'Please fill in all required fields (Street, City, Province)';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.addressService.addAddress(this.formData).subscribe({
      next: (address) => {
        console.log('Address saved successfully:', address);
        this.addressSaved.emit(address);
        this.closeDialog.emit();
        this.resetForm();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error saving address:', error);
        this.errorMessage = error.message || 'Failed to save address. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Reset the form
   */
  private resetForm(): void {
    this.formData = {
      street: '',
      barangay: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Philippines',
      phoneNumber: '',
      label: 'Home',
      isDefault: true
    };
    this.errorMessage = '';
  }
}
