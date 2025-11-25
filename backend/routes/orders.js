const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendOrderConfirmationEmail } = require('../services/emailService');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   POST /api/orders
// @desc    Create a new order
// @access  Private
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
    const pincodeMatch = value.match(/\d{6}/);
    if (!pincodeMatch) {
      throw new Error('Please provide a valid 6-digit pincode');
    }
    return true;
  }),
  body('shippingAddress.phone').custom((value) => {
    const phoneMatch = value.match(/\d{10}/);
    if (!phoneMatch) {
      throw new Error('Please provide a valid 10-digit phone number');
    }
    return true;
  }),
  body('paymentMethod').isIn(['cod', 'online', 'demo', 'razorpay']).withMessage('Invalid payment method'),
  body('totalAmount').isNumeric().withMessage('Total amount must be a number')
], async (req, res) => {
  try {
    console.log('📦 Creating order with data:', JSON.stringify(req.body, null, 2));
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, shippingAddress, paymentMethod, notes, totalAmount } = req.body;

    // Validate all products and use provided total amount
    const validatedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product} not found or inactive`
        });
      }

      // Check if size is available
      if (!product.sizes.includes(item.size)) {
        return res.status(400).json({
          success: false,
          message: `Size ${item.size} not available for product ${product.name}`
        });
      }

      // Check stock
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product ${product.name}. Available: ${product.stock}`
        });
      }

      // Check availability
      if (item.type === 'purchase' && !product.availability.purchase) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available for purchase`
        });
      }

      if (item.type === 'rental') {
        if (!product.availability.rental) {
          return res.status(400).json({
            success: false,
            message: `Product ${product.name} is not available for rental`
          });
        }
        
        if (!item.rentalPeriod) {
          return res.status(400).json({
            success: false,
            message: `Rental period is required for rental items`
          });
        }

        if (!product.price.rental[item.rentalPeriod]) {
          return res.status(400).json({
            success: false,
            message: `Rental period ${item.rentalPeriod} not available for product ${product.name}`
          });
        }
      }

      // Calculate item price
      let itemPrice = 0;
      if (item.type === 'purchase') {
        itemPrice = product.price.purchase * item.quantity;
      } else {
        itemPrice = product.price.rental[item.rentalPeriod] * item.quantity;
      }

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

    // Create order
    const order = new Order({
      user: req.user._id,
      items: validatedItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes
    });

    await order.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // Clear user cart
    req.user.cart = [];
    await req.user.save();

    await order.populate('user', 'name email phone');
    await order.populate('items.product', 'name images');

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(req.user.email, order, order.items);
      console.log('Order confirmation email sent to:', req.user.email);
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate
    } = req.query;

    // Build filter
    const filter = { user: req.user._id };
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await Order.find(filter)
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images seller category sizes colors');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to the user
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own orders'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:id/cancel', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to the user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only cancel your own orders'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order'
    });
  }
});

// @route   POST /api/orders/:id/payment/demo
// @desc    Process demo payment
// @access  Private
router.post('/:id/payment/demo', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to the user
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if payment is already processed
    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Payment has already been processed'
      });
    }

    // Simulate payment processing
    const demoPaymentId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate payment success (90% success rate for demo)
    const paymentSuccess = Math.random() > 0.1;

    if (paymentSuccess) {
      order.paymentStatus = 'paid';
      order.demoPaymentId = demoPaymentId;
      order.demoPaymentStatus = 'success';
      order.status = 'confirmed';
      
      await order.save();

      res.json({
        success: true,
        message: 'Payment processed successfully',
        data: {
          order,
          paymentId: demoPaymentId,
          status: 'success'
        }
      });
    } else {
      order.demoPaymentId = demoPaymentId;
      order.demoPaymentStatus = 'failed';
      
      await order.save();

      res.status(400).json({
        success: false,
        message: 'Payment failed. Please try again.',
        data: {
          paymentId: demoPaymentId,
          status: 'failed'
        }
      });
    }
  } catch (error) {
    console.error('Demo payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while processing payment'
    });
  }
});

// @route   GET /api/orders/:id/receipt
// @desc    Generate order receipt
// @access  Private
router.get('/:id/receipt', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.product', 'name images');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order belongs to the user
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Generate receipt data
    const receipt = {
      orderNumber: order.orderNumber,
      orderDate: order.createdAt,
      customer: {
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone,
        address: order.shippingAddress
      },
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        type: item.type,
        rentalPeriod: item.rentalPeriod,
        price: item.price,
        image: item.image
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      estimatedDelivery: order.estimatedDelivery
    };

    res.json({
      success: true,
      data: { receipt }
    });
  } catch (error) {
    console.error('Generate receipt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating receipt'
    });
  }
});

module.exports = router;
