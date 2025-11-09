# Firestore Setup Guide

Quick guide to set up Firestore database for the Pasta & Pastries website.

## Step 1: Configure Firestore Security Rules (REQUIRED)

Before seeding the database, you need to set up security rules in Firebase Console.

### Option A: Temporary Testing Rules (Use for initial setup only)

⚠️ **Warning**: These rules allow anyone to write to your database. Only use for initial testing!

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **pasta-and-pastries**
3. Navigate to: **Firestore Database** > **Rules** tab
4. Replace with these temporary rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Temporary: Allow all reads and writes for testing
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

5. Click **Publish**

### Option B: Production-Ready Rules (Recommended after seeding)

After seeding your database, update to these secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Products collection - public read, no client writes
    match /products/{productId} {
      allow read: if true;
      allow write: if false;  // Only admins can write via Console/Admin SDK
    }

    // Orders collection - users can only access their own orders
    match /orders/{orderId} {
      // Read own orders only
      allow read: if request.auth != null
                  && resource.data.userId == request.auth.uid;

      // Create orders for yourself only
      allow create: if request.auth != null
                    && request.resource.data.userId == request.auth.uid;

      // No updates or deletes from client (admin only)
      allow update, delete: if false;
    }
  }
}
```

## Step 2: Seed the Database

Once security rules are configured, run the seeding script:

```bash
node scripts/seed-firestore-web.mjs
```

**Expected Output:**
```
🌱 Starting Firestore seeding (Web SDK)...

📦 Adding product: Lasagna (ID: 1)
✅ Successfully added: Lasagna

📦 Adding product: Cheesy Baked Mac (ID: 2)
✅ Successfully added: Cheesy Baked Mac

📦 Adding product: Choco Banana Muffins (ID: 3)
✅ Successfully added: Choco Banana Muffins

📦 Adding product: Carrot Muffins (ID: 4)
✅ Successfully added: Carrot Muffins

🎉 Seeding completed successfully!
📊 Total products added: 4

✨ All done! Your Firestore database is ready to use.
```

## Step 3: Verify the Data

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Navigate to: **Firestore Database** > **Data** tab
3. You should see a **products** collection with 4 documents:
   - Document ID: **1** (Lasagna)
   - Document ID: **2** (Cheesy Baked Mac)
   - Document ID: **3** (Choco Banana Muffins)
   - Document ID: **4** (Carrot Muffins)

## Step 4: Update Security Rules (If using temporary rules)

If you used the temporary testing rules in Step 1, **immediately** update to the production-ready rules:

1. Go back to: **Firestore Database** > **Rules** tab
2. Replace with Option B rules (production-ready)
3. Click **Publish**

## Step 5: Test the Application

### Development Mode (Mock Data)
```bash
npm start
```
- Opens: http://localhost:4200
- Uses mock data (no Firestore calls)
- Free and fast

### Production Mode Testing (Firestore)
```bash
# Temporarily enable Firestore
# Edit src/environments/environment.development.ts
# Change: useMockData: true  →  useMockData: false

npm start
```
- Opens: http://localhost:4200
- Uses Firestore data
- Requires sign-in for orders

## Troubleshooting

### Error: "Missing or insufficient permissions"

**Cause**: Security rules not configured or too restrictive

**Solution**:
1. Check Firebase Console > Firestore Database > Rules
2. Ensure temporary testing rules are active for seeding
3. After seeding, switch to production-ready rules

### Error: "Cannot use import statement outside a module"

**Cause**: Using `.ts` file instead of `.mjs`

**Solution**:
```bash
# Use the .mjs version:
node scripts/seed-firestore-web.mjs
```

### No products showing in the app

**Causes**:
1. Firestore not seeded yet
2. Using production mode but security rules blocking reads
3. Network connectivity issues

**Solutions**:
1. Run seeding script: `node scripts/seed-firestore-web.mjs`
2. Check security rules allow `allow read: if true` for products
3. Check browser console for errors

### Orders not saving in production mode

**Cause**: User not authenticated

**Solution**:
1. Click "Sign In" button in navbar
2. Sign in with Google account
3. Try creating order again

## Quick Reference

### Development Mode
- **Environment**: `environment.development.ts`
- **Data Source**: Mock data (in-memory)
- **Storage**: localStorage for orders
- **Authentication**: Not required
- **Cost**: Free

### Production Mode
- **Environment**: `environment.ts`
- **Data Source**: Firestore database
- **Storage**: Firestore for orders
- **Authentication**: Required for orders
- **Cost**: Per Firestore usage

## Security Best Practices

✅ **DO:**
- Use production-ready rules after seeding
- Require authentication for order creation
- Only allow users to read their own orders
- Monitor Firestore usage in Firebase Console

❌ **DON'T:**
- Leave testing rules (`allow write: if true`) active
- Share your Firebase config publicly (it's already in your repo, but with proper rules it's safe)
- Store sensitive data in Firestore without proper rules
- Forget to update rules after initial setup

## Next Steps

1. ✅ Configure Firestore security rules
2. ✅ Run seeding script
3. ✅ Verify data in Firebase Console
4. ✅ Update to production-ready rules
5. ✅ Test application in development mode
6. ⬜ Test application in production mode
7. ⬜ Deploy to production

## Support

For detailed documentation, see:
- `FIRESTORE_INTEGRATION.md` - Complete technical documentation
- `scripts/README.md` - Seeding script details

---

**Quick Start Summary:**
```bash
# 1. Configure security rules in Firebase Console (see Step 1)
# 2. Seed the database
node scripts/seed-firestore-web.mjs
# 3. Verify in Firebase Console
# 4. Start development server
npm start
```

That's it! Your Firestore database is ready to use. 🚀
