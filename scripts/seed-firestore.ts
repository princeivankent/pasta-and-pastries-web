/**
 * Firestore Database Seeding Script
 *
 * This script populates the Firestore database with initial product data.
 *
 * Usage:
 *   1. Install ts-node if not already installed: npm install -g ts-node
 *   2. Run the script: ts-node scripts/seed-firestore.ts
 *
 * Note: This script uses the Firebase Admin SDK which requires service account credentials.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
// Note: You'll need to download your service account key from Firebase Console
// Go to: Project Settings > Service Accounts > Generate New Private Key
// Save it as firebase-service-account.json in the project root
const serviceAccount = require('../firebase-service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// Product data to seed (matches the mock data from ProductsService)
const products = [
  {
    id: '1',
    name: 'Lasagna',
    category: 'pasta',
    description: 'Creamy layers with 100% beef and mozzarella',
    price: 180,
    image: 'images/lasagna.jpg',
    isBestSeller: true,
    ingredients: ['Pasta sheets', 'Beef', 'Mozzarella', 'Tomato sauce', 'Herbs'],
    variants: [
      {
        id: 'small',
        label: 'Small',
        price: 180,
        servings: 'Good for 2 persons',
        dimensions: '7.5" x 4.33" x 1.77" 550ml'
      },
      {
        id: 'medium',
        label: 'Medium',
        price: 399,
        servings: 'Good for 4-5 persons',
        dimensions: '9" x 6.6" x 1.9" 1100ml'
      },
      {
        id: 'large',
        label: 'Large',
        price: 799,
        servings: 'Good for 6-9 persons',
        dimensions: '12" x 8" x 2" 2300ml'
      }
    ]
  },
  {
    id: '2',
    name: 'Cheesy Baked Mac',
    category: 'pasta',
    description: 'Rich and creamy baked macaroni with cheese',
    price: 140,
    image: 'images/cheesy-baked-mac.jpg',
    isBestSeller: true,
    ingredients: ['Macaroni', 'Cheddar cheese', 'Milk', 'Butter', 'Breadcrumbs']
  },
  {
    id: '3',
    name: 'Choco Banana Muffins',
    category: 'pastry',
    description: 'Moist chocolate muffins with ripe bananas - Box of 4',
    price: 130,
    image: 'images/choco-banana-muffins.jpg',
    isBestSeller: true,
    ingredients: ['Ripe bananas', 'Chocolate chips', 'Flour', 'Sugar', 'Eggs']
  },
  {
    id: '4',
    name: 'Carrot Muffins',
    category: 'pastry',
    description: 'Sweet and spiced carrot muffins - Box of 4',
    price: 260,
    image: 'images/carot-muffins.jpg',
    isBestSeller: true,
    ingredients: ['Carrots', 'Flour', 'Cinnamon', 'Sugar', 'Walnuts']
  }
];

/**
 * Seed products into Firestore
 */
async function seedProducts() {
  console.log('🌱 Starting Firestore seeding...\n');

  try {
    for (const product of products) {
      const { id, ...productData } = product;

      console.log(`📦 Adding product: ${product.name} (ID: ${id})`);

      // Set document with custom ID
      await db.collection('products').doc(id).set(productData);

      console.log(`✅ Successfully added: ${product.name}\n`);
    }

    console.log('🎉 Seeding completed successfully!');
    console.log(`📊 Total products added: ${products.length}`);

  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    process.exit(1);
  }
}

/**
 * Verify seeded data
 */
async function verifySeeding() {
  console.log('\n🔍 Verifying seeded data...\n');

  try {
    const snapshot = await db.collection('products').get();

    console.log(`📊 Total products in Firestore: ${snapshot.size}`);

    snapshot.forEach(doc => {
      console.log(`  - ${doc.id}: ${doc.data().name}`);
    });

    console.log('\n✅ Verification complete!');

  } catch (error) {
    console.error('❌ Error verifying data:', error);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    await seedProducts();
    await verifySeeding();

    console.log('\n✨ All done! Your Firestore database is ready to use.\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the seeding script
main();
