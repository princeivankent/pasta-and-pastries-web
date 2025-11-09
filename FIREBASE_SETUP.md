# Firebase Google Authentication Setup Guide

This guide will help you complete the Firebase Google authentication setup for Pasta & Pastries.

## What's Already Done ✅

1. ✅ Firebase packages installed (`firebase` and `@angular/fire@^19.0.0`)
2. ✅ Environment configuration files created
3. ✅ Firebase initialized in `app.config.ts`
4. ✅ Authentication service created (`AuthService`)
5. ✅ Login/Logout UI added to navbar
6. ✅ Firebase hosting configured for Angular build output

## What You Need to Do 📝

### Step 1: Get Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `pasta-and-pastries`
3. Click on the gear icon (⚙️) > Project Settings
4. Scroll down to "Your apps" section
5. If you haven't added a web app yet, click "Add app" and select Web (</>)
6. Copy the Firebase configuration object

### Step 2: Update Environment Files

Replace the placeholder values in both environment files with your actual Firebase config:

**File: `src/environments/environment.development.ts`**
```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_ACTUAL_API_KEY",              // Replace this
    authDomain: "pasta-and-pastries.firebaseapp.com",
    projectId: "pasta-and-pastries",
    storageBucket: "pasta-and-pastries.firebasestorage.app",
    messagingSenderId: "YOUR_ACTUAL_SENDER_ID", // Replace this
    appId: "YOUR_ACTUAL_APP_ID"                 // Replace this
  }
};
```

**File: `src/environments/environment.ts`** (same values for production)

### Step 3: Enable Google Sign-In in Firebase

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Google** in the providers list
3. Click **Enable** toggle
4. Add your support email
5. Click **Save**

### Step 4: Configure Authorized Domains

1. In Firebase Console > **Authentication** > **Settings** > **Authorized domains**
2. Add your development domain (usually `localhost` is already there)
3. Add your production domain when deploying

### Step 5: Test the Integration

1. Start the development server:
   ```bash
   npm start
   ```

2. Open `http://localhost:4200`

3. Click the "Sign in" button in the navbar

4. You should see a Google sign-in popup

5. After successful login, you'll see your profile picture/name in the navbar

## How It Works 🔧

### AuthService (`src/app/services/auth.service.ts`)

The authentication service provides three main methods:

- **`signInWithGoogle()`**: Opens Google sign-in popup
- **`signOutUser()`**: Signs out the current user
- **`user$`**: Observable that emits the current user state

### Navbar Integration

The navbar component (`src/app/components/navbar/`) displays:
- "Sign in" button when no user is logged in
- User avatar with dropdown menu when logged in
- Sign out option in the dropdown

### Firebase Configuration

Firebase is initialized in `src/app/app.config.ts` with:
- `provideFirebaseApp()` - Initializes Firebase with your config
- `provideAuth()` - Sets up Firebase Authentication

## Security Notes 🔒

### Environment Files

- The environment template files are committed to git with placeholder values
- For local development, you can either:
  - Replace placeholders directly (not recommended for teams)
  - Create `environment.local.ts` files (already in .gitignore)

### Firebase Security Rules

Update your Firestore rules in `firestore.rules` based on your needs:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Allow read/write only for authenticated users
      allow read, write: if request.auth != null;
    }
  }
}
```

Deploy rules with:
```bash
firebase deploy --only firestore:rules
```

## Troubleshooting 🔍

### "Firebase: Error (auth/unauthorized-domain)"
- Add your domain to authorized domains in Firebase Console

### "Firebase: Error (auth/api-key-not-valid)"
- Check that your API key is correctly copied from Firebase Console

### Popup Blocked
- Make sure popup blockers aren't preventing the Google sign-in window
- Try clicking the sign-in button instead of automatic sign-in

### SSR Issues
- Firebase Auth works in the browser only
- The app already checks for browser environment with `isPlatformBrowser()`

## Next Steps 🚀

After Google login is working, you can:

1. **Store user data in Firestore**
   ```typescript
   // Example: Save user profile
   import { Firestore, doc, setDoc } from '@angular/fire/firestore';

   async saveUserProfile(user: User) {
     const userRef = doc(this.firestore, 'users', user.uid);
     await setDoc(userRef, {
       displayName: user.displayName,
       email: user.email,
       photoURL: user.photoURL,
       lastLogin: new Date()
     });
   }
   ```

2. **Protect routes with auth guards**
3. **Link orders to authenticated users**
4. **Add user profile page**
5. **Implement order history**

## Additional Resources 📚

- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [AngularFire Documentation](https://github.com/angular/angularfire)
- [Firebase Console](https://console.firebase.google.com/)

## Support

For issues or questions, check the Firebase Console logs or browser console for detailed error messages.
