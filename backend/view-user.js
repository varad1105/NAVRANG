const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function viewUser(userId = null) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('🔗 Connected to MongoDB\n');

    if (userId) {
      // View specific user
      const user = await User.findById(userId);
      if (user) {
        console.log('👤 USER DETAILS:');
        console.log('═'.repeat(40));
        console.log(`ID: ${user._id}`);
        console.log(`Name: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Phone: ${user.phone}`);
        console.log(`Role: ${user.role}`);
        console.log(`Created: ${user.createdAt}`);
        
        if (user.cart.length > 0) {
          console.log('\n🛒 CART ITEMS:');
          user.cart.forEach((item, i) => {
            console.log(`${i + 1}. Product: ${item.product}`);
            console.log(`   Quantity: ${item.quantity}`);
            console.log(`   Size: ${item.size}`);
          });
        }
        
        if (user.wishlist.length > 0) {
          console.log('\n❤️ WISHLIST:');
          user.wishlist.forEach((item, i) => {
            console.log(`${i + 1}. Product: ${item}`);
          });
        }
        
        if (user.addresses.length > 0) {
          console.log('\n🏠 ADDRESSES:');
          user.addresses.forEach((addr, i) => {
            console.log(`${i + 1}. ${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}`);
            console.log(`   Default: ${addr.isDefault ? 'Yes' : 'No'}`);
          });
        }
      } else {
        console.log('❌ User not found');
      }
    } else {
      // View all users (summary)
      const users = await User.find({});
      console.log('👥 ALL USERS:');
      console.log('═'.repeat(40));
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Phone: ${user.phone}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

// Get user ID from command line arguments
const userId = process.argv[2];
viewUser(userId);
