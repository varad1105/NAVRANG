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
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod'], // cash on delivery
    default: 'razorpay'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
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
  demoPaymentStatus: String,
  // Razorpay payment fields
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  paymentDate: Date,
  paymentError: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
