/**
 * Firestore Database Seeding Script (Using Web SDK - ES Module)
 *
 * This script populates the Firestore database with initial product data using the Firebase Web SDK.
 *
 * Usage:
 *   node scripts/seed-firestore-web.mjs
 *
 * Note: Make sure you have the correct Firebase configuration in your environment files.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// Firebase configuration from your environment
const firebaseConfig = {
  apiKey: "AIzaSyCLhbGhKbV7b8dcXQX208832t1SKhWRe0A",
  authDomain: "pasta-and-pastries.firebaseapp.com",
  projectId: "pasta-and-pastries",
  storageBucket: "pasta-and-pastries.firebasestorage.app",
  messagingSenderId: "457359953885",
  appId: "1:457359953885:web:6f81eff80b325d99e73034"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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
  console.log('🌱 Starting Firestore seeding (Web SDK)...\n');

  try {
    const productsCollection = collection(db, 'products');

    for (const product of products) {
      const { id, ...productData } = product;

      console.log(`📦 Adding product: ${product.name} (ID: ${id})`);

      // Set document with custom ID
      const productDoc = doc(productsCollection, id);
      await setDoc(productDoc, productData);

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
 * Main execution
 */
async function main() {
  try {
    await seedProducts();

    console.log('\n✨ All done! Your Firestore database is ready to use.');
    console.log('💡 Tip: You can verify the data in the Firebase Console: https://console.firebase.google.com/\n');

    process.exit(0);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the seeding script
main();
