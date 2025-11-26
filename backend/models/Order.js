const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        size: { type: String, required: true },
        color: { type: String, required: true },
        price: { type: Number, required: true },
        type: {
          type: String,
          enum: ["purchase", "rental"],
          required: true
        },
        rentalPeriod: {
          type: String,
          enum: ["3-days", "7-days", "15-days"]
        },
        image: String
      }
    ],

    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "returned"
      ],
      default: "pending"
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending"
    },

    paymentMethod: {
      type: String,
      enum: ["razorpay", "cod", "online", "demo"],
      default: "razorpay"
    },

    // Razorpay payment details
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    // Demo payment
    demoPaymentId: String,
    demoPaymentStatus: String,

    // Payment metadata
    paymentDate: Date,
    paymentError: String,

    // Shipping Address
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      phone: { type: String, required: true }
    },

    // Delivery Tracking
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date,

    // NEW FIELD: Delivery Updates
    deliveryUpdates: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
        message: String
      }
    ],

    notes: String,

    // Rental-specific fields
    rentalStartDate: Date,
    rentalEndDate: Date,
    rentalReturnDate: Date,
    rentalStatus: {
      type: String,
      enum: ["active", "returned", "overdue", "damaged"],
      default: null
    }
  },
  { timestamps: true }
);

// Auto-generate order number (ORD000001)
orderSchema.pre("save", async function (next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD${String(count + 1).padStart(6, "0")}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
