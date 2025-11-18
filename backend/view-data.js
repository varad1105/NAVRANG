const mongoose = require('mongoose');
require('dotenv').config();

// Import your models
const User = require('./models/User');
const Product = require('./models/Product');

async function viewData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🔗 Connected to MongoDB\n');

    console.log('📊 DATABASE: navrang-navratri');
    console.log('═'.repeat(50));

    // View Users
    console.log('\n👥 USERS COLLECTION:');
    const users = await User.find({});
    console.log(`Total Users: ${users.length}`);
    
    if (users.length > 0) {
      users.forEach((user, index) => {
        console.log(`\n${index + 1}. User ID: ${user._id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Phone: ${user.phone}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Cart Items: ${user.cart.length}`);
        console.log(`   Wishlist Items: ${user.wishlist.length}`);
        console.log(`   Addresses: ${user.addresses.length}`);
        console.log(`   Created: ${user.createdAt}`);
      });
    } else {
      console.log('   No users found');
    }

    // View Products
    console.log('\n\n🛍️ PRODUCTS COLLECTION:');
    const products = await Product.find({});
    console.log(`Total Products: ${products.length}`);
    
    if (products.length > 0) {
      products.forEach((product, index) => {
        console.log(`\n${index + 1}. Product ID: ${product._id}`);
        console.log(`   Name: ${product.name}`);
        console.log(`   Category: ${product.category} - ${product.subCategory}`);
        console.log(`   Price: ₹${product.price.purchase}`);
        console.log(`   Stock: ${product.stock}`);
        console.log(`   Sizes: ${product.sizes.join(', ')}`);
        console.log(`   Colors: ${product.colors.join(', ')}`);
        console.log(`   Seller: ${product.seller.name || 'Unknown'}`);
        console.log(`   Created: ${product.createdAt}`);
      });
    } else {
      console.log('   No products found');
    }

    // View Collections Summary
    console.log('\n\n📋 COLLECTIONS SUMMARY:');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   ${collection.name}: ${count} documents`);
    }

  } catch (error) {
    console.error('❌ Error viewing data:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Run the function
viewData();
