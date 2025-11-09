export interface Address {
  id?: string; // Firestore document ID
  userId: string; // Firebase Auth user ID
  street: string;
  barangay?: string; // Optional: for Philippines
  city: string;
  province: string;
  postalCode?: string;
  country: string;
  phoneNumber?: string;
  isDefault: boolean; // Mark as default delivery address
  label?: string; // e.g., "Home", "Work", "Other"
  createdAt: Date;
  updatedAt: Date;
}
