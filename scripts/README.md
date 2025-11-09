# Firestore Database Seeding Scripts

This directory contains scripts to populate your Firestore database with initial product data.

## Available Scripts

### 1. `seed-firestore-web.mjs` (Recommended ⭐)

Uses the Firebase Web SDK with ES modules - simplest approach, no additional dependencies needed.

**Prerequisites:**
- Node.js installed
- Firebase project configured
- Internet connection

**Usage:**
```bash
node scripts/seed-firestore-web.mjs
```

### 2. `seed-firestore-web.ts` (Alternative)

TypeScript version using ts-node - requires additional configuration.

**Prerequisites:**
- Node.js installed
- Firebase project configured
- Internet connection

**Usage:**
```bash
npx ts-node scripts/seed-firestore-web.ts
```

**Note**: If you get "Cannot use import statement" error, use the `.mjs` version instead.

### 2. `seed-firestore.ts` (Advanced)

Uses the Firebase Admin SDK - requires service account credentials.

**Prerequisites:**
- Node.js installed
- Firebase service account key (download from Firebase Console)
- Save the service account key as `firebase-service-account.json` in the project root

**Usage:**
```bash
npx ts-node scripts/seed-firestore.ts
```

## What Gets Seeded?

The scripts will populate the `products` collection in Firestore with 4 initial products:

1. **Lasagna** (ID: '1')
   - Category: pasta
   - Has 3 variants (Small, Medium, Large)
   - Best seller

2. **Cheesy Baked Mac** (ID: '2')
   - Category: pasta
   - Single price
   - Best seller

3. **Choco Banana Muffins** (ID: '3')
   - Category: pastry
   - Single price
   - Best seller

4. **Carrot Muffins** (ID: '4')
   - Category: pastry
   - Single price
   - Best seller

## Firestore Security Rules

After seeding, make sure to set up proper security rules in the Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products collection - read-only for all, write for authenticated users only
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Orders collection - users can only read/write their own orders
    match /orders/{orderId} {
      allow read: if request.auth != null && resource.data.userId == request.auth.uid;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update: if request.auth != null && resource.data.userId == request.auth.uid;
    }
  }
}
```

## Verification

After running the seeding script, verify the data in:
- **Firebase Console**: https://console.firebase.google.com/
- Navigate to: Firestore Database > products collection

You should see 4 documents with IDs: '1', '2', '3', '4'

## Troubleshooting

### "Module not found" errors
Install missing dependencies:
```bash
npm install firebase firebase-admin
npm install -D ts-node @types/node
```

### "Permission denied" errors
Check your Firebase security rules and ensure they allow writes.

### "Network error" errors
Check your internet connection and Firebase project configuration.

## Notes

- Running the script multiple times will overwrite existing products with the same IDs
- The script uses custom document IDs ('1', '2', '3', '4') instead of auto-generated IDs
- Product images reference the `images/` folder - make sure these images exist in your assets
