const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    size: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    type: {
      type: String,
      enum: ['purchase', 'rental'],
      required: true
    },
    rentalPeriod: {
      type: String,
      enum: ['3-days', '7-days', '15-days']
    },
    image: String
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'demo'],
    default: 'cod'
  },
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  trackingNumber: String,
  estimatedDelivery: Date,
  actualDelivery: Date,
  notes: String,
  // Rental specific fields
  rentalStartDate: Date,
  rentalEndDate: Date,
  rentalReturnDate: Date,
  rentalStatus: {
    type: String,
    enum: ['active', 'returned', 'overdue', 'damaged'],
    default: null
  },
  // Demo payment fields
  demoPaymentId: String,
  demoPaymentStatus: String
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `NR${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Calculate rental dates if it's a rental order
orderSchema.pre('save', function(next) {
  if (this.isModified('items') && this.items.some(item => item.type === 'rental')) {
    const rentalItem = this.items.find(item => item.type === 'rental');
    if (rentalItem && rentalItem.rentalPeriod) {
      this.rentalStartDate = new Date();
      const days = parseInt(rentalItem.rentalPeriod.split('-')[0]);
      this.rentalEndDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    }
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
