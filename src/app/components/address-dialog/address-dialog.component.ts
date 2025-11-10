import { Component, EventEmitter, Input, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddressService, UserAddress } from '../../services/address.service';

@Component({
  selector: 'app-address-dialog',
  imports: [CommonModule, FormsModule],
  templateUrl: './address-dialog.component.html',
  styleUrl: './address-dialog.component.scss'
})
export class AddressDialogComponent implements OnInit {
  @Input() isOpen = false;
  @Input() isWelcomeDialog = false; // True for new user welcome, false for regular address management
  @Output() closeDialog = new EventEmitter<void>();
  @Output() addressSaved = new EventEmitter<UserAddress>();

  private addressService = inject(AddressService);

  // Form data
  formData = {
    address: '',
    phoneNumber: ''
  };

  isSubmitting = false;
  errorMessage = '';

  ngOnInit(): void {
    // Load existing address if available
    this.addressService.getUserAddress().subscribe({
      next: (userAddress) => {
        if (userAddress) {
          this.formData.address = userAddress.address;
          this.formData.phoneNumber = userAddress.phoneNumber || '';
        }
      },
      error: (error) => {
        console.log('No existing address found:', error);
      }
    });
  }

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
    if (!this.formData.address.trim()) {
      this.errorMessage = 'Please enter your delivery address';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.addressService.saveUserAddress(this.formData.address, this.formData.phoneNumber).subscribe({
      next: (userAddress) => {
        console.log('Address saved successfully:', userAddress);
        this.addressSaved.emit(userAddress);
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
      address: '',
      phoneNumber: ''
    };
    this.errorMessage = '';
  }
}
