const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Product = require('./models/Product');

async function deleteData(collection, id = null) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🔗 Connected to MongoDB\n');

    switch (collection) {
      case 'users':
        if (id) {
          const result = await User.findByIdAndDelete(id);
          if (result) {
            console.log(`✅ Deleted user: ${result.name} (${result.email})`);
          } else {
            console.log('❌ User not found');
          }
        } else {
          const result = await User.deleteMany({});
          console.log(`✅ Deleted ${result.deletedCount} users`);
        }
        break;
        
      case 'products':
        if (id) {
          const result = await Product.findByIdAndDelete(id);
          if (result) {
            console.log(`✅ Deleted product: ${result.name}`);
          } else {
            console.log('❌ Product not found');
          }
        } else {
          const result = await Product.deleteMany({});
          console.log(`✅ Deleted ${result.deletedCount} products`);
        }
        break;
        
      default:
        console.log('❌ Invalid collection. Use: users or products');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

// Get arguments: collection and optional id
const collection = process.argv[2];
const id = process.argv[3];

if (!collection) {
  console.log('Usage: node delete-data.js <collection> [id]');
  console.log('Collections: users, products');
  console.log('Example: node delete-data.js users');
  console.log('Example: node delete-data.js users 64a1b2c3d4e5f6789012345');
} else {
  deleteData(collection, id);
}
