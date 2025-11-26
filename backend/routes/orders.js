const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendOrderConfirmationEmail, sendStatusUpdateEmail } = require('../services/emailService');

const router = express.Router();

// All routes protected
router.use(protect);

/*
|--------------------------------------------------------------------------
| CREATE ORDER
|--------------------------------------------------------------------------
*/
router.post('/', [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.product').isMongoId().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.size').isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL']).withMessage('Invalid size'),
  body('items.*.type').isIn(['purchase', 'rental']).withMessage('Type must be purchase or rental'),
  body('items.*.rentalPeriod').optional().isIn(['3-days', '7-days', '15-days']).withMessage('Invalid rental period'),
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.pincode').custom((value) => {
    if (!/^\d{6}$/.test(value)) throw new Error('Invalid 6-digit pincode');
    return true;
  }),
  body('shippingAddress.phone').custom((value) => {
    if (!/^\d{10}$/.test(value)) throw new Error('Invalid 10-digit phone number');
    return true;
  }),
  body('paymentMethod').isIn(['cod', 'online', 'demo', 'razorpay']).withMessage('Invalid payment method'),
  body('totalAmount').isNumeric().withMessage('Total amount must be a number')
], async (req, res) => {
  try {
    console.log('📦 Creating order:', req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    }

    const { items, shippingAddress, paymentMethod, notes, totalAmount } = req.body;

    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product || !product.isActive) {
        return res.status(404).json({ success: false, message: `Product ${item.product} not found or inactive` });
      }

      if (!product.sizes.includes(item.size)) {
        return res.status(400).json({ success: false, message: `Size ${item.size} not available` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}` });
      }

      if (item.type === 'purchase' && !product.availability.purchase) {
        return res.status(400).json({ success: false, message: `${product.name} not available for purchase` });
      }

      if (item.type === 'rental') {
        if (!product.availability.rental) {
          return res.status(400).json({ success: false, message: `${product.name} not available for rental` });
        }

        if (!product.price.rental[item.rentalPeriod]) {
          return res.status(400).json({ success: false, message: `Rental period invalid for ${product.name}` });
        }
      }

      let itemPrice = item.type === 'purchase'
        ? product.price.purchase * item.quantity
        : product.price.rental[item.rentalPeriod] * item.quantity;

      validatedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color || product.colors[0],
        price: itemPrice,
        type: item.type,
        rentalPeriod: item.rentalPeriod,
        image: product.images[0]?.url
      });
    }

    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD${String(orderCount + 1).padStart(6, '0')}`;

    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: validatedItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes
    });

    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
    }

    req.user.cart = [];
    await req.user.save();

    await order.populate('user', 'name email phone');

    try {
      await sendOrderConfirmationEmail(req.user.email, order, order.items);
    } catch (err) {
      console.log('Email failed but order saved');
    }

    res.status(201).json({ success: true, message: 'Order created', data: { order } });

  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ success: false, message: 'Server error creating order' });
  }
});

/*
|--------------------------------------------------------------------------
| GET USER ORDERS
|--------------------------------------------------------------------------
*/
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, startDate, endDate } = req.query;

    const filter = { user: req.user._id };

    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalOrders: total
        }
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching orders' });
  }
});

/*
|--------------------------------------------------------------------------
| GET SINGLE ORDER
|--------------------------------------------------------------------------
*/
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images seller category sizes colors');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: { order } });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching order' });
  }
});

/*
|--------------------------------------------------------------------------
| CANCEL ORDER
|--------------------------------------------------------------------------
*/
router.put('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Order cannot be cancelled now' });
    }

    order.status = 'cancelled';
    await order.save();

    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }

    res.json({ success: true, message: 'Order cancelled', data: { order } });

  } catch (err) {
    res.status(500).json({ message: 'Cancel error' });
  }
});

/*
|--------------------------------------------------------------------------
| DEMO PAYMENT
|--------------------------------------------------------------------------
*/
router.post('/:id/payment/demo', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({ message: 'Payment already processed' });
    }

    const demoPaymentId = `demo_${Date.now()}`;
    const success = Math.random() > 0.1;

    if (success) {
      order.paymentStatus = 'completed';
      order.status = 'confirmed';
      order.demoPaymentId = demoPaymentId;
      order.demoPaymentStatus = 'success';
      await order.save();

      return res.json({
        success: true,
        message: 'Payment success',
        data: { order, paymentId: demoPaymentId }
      });
    }

    order.demoPaymentStatus = 'failed';
    await order.save();

    res.status(400).json({ success: false, message: 'Payment failed', paymentId: demoPaymentId });

  } catch (err) {
    res.status(500).json({ message: 'Payment error' });
  }
});

/*
|--------------------------------------------------------------------------
| ORDER RECEIPT
|--------------------------------------------------------------------------
*/
router.get('/:id/receipt', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const receipt = {
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      customer: {
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone,
        address: order.shippingAddress
      },
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      estimatedDelivery: order.estimatedDelivery
    };

    res.json({ success: true, data: { receipt } });

  } catch (err) {
    res.status(500).json({ message: 'Receipt error' });
  }
});

/*
|--------------------------------------------------------------------------
| UPDATE ORDER STATUS (ADMIN / SELLER)
|--------------------------------------------------------------------------
*/
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, message } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    order.status = status;
    order.deliveryUpdates.push({ status, message });
    await order.save();

    const user = await User.findById(order.user);
    if (user) {
      await sendStatusUpdateEmail(user.email, {
        orderId: order.orderNumber,
        status,
        message,
        userName: user.name
      });
    }

    res.json({ success: true, data: order });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
