const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');

const router = express.Router();

// All routes are protected and require seller role
router.use(protect, authorize('seller'));

// @route   GET /api/sellers/dashboard
// @desc    Get seller dashboard stats
// @access  Private (Seller only)
router.get('/dashboard', async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Get product stats
    const totalProducts = await Product.countDocuments({ 
      seller: sellerId, 
      isActive: true 
    });
    
    const activeProducts = await Product.countDocuments({ 
      seller: sellerId, 
      isActive: true,
      stock: { $gt: 0 }
    });

    // Get order stats
    const orders = await Order.find({ 
      'items.product': { $in: await Product.find({ seller: sellerId }).distinct('_id') }
    });

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'delivered').length;

    // Calculate total revenue
    const totalRevenue = orders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((total, order) => total + order.totalAmount, 0);

    // Get recent orders
    const recentOrders = await Order.find({ 
      'items.product': { $in: await Product.find({ seller: sellerId }).distinct('_id') }
    })
    .populate('user', 'name email')
    .populate('items.product', 'name images')
    .sort({ createdAt: -1 })
    .limit(5);

    // Get low stock products
    const lowStockProducts = await Product.find({ 
      seller: sellerId, 
      isActive: true,
      stock: { $lt: 5 }
    })
    .select('name stock images')
    .sort({ stock: 1 })
    .limit(5);

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts,
          activeProducts,
          totalOrders,
          pendingOrders,
          completedOrders,
          totalRevenue
        },
        recentOrders,
        lowStockProducts
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// @route   GET /api/sellers/products
// @desc    Get seller's products
// @access  Private (Seller only)
router.get('/products', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      search
    } = req.query;

    // Build filter
    const filter = { seller: req.user._id };
    
    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }
    
    if (category) {
      filter.category = category;
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalProducts: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
});

// @route   GET /api/sellers/orders
// @desc    Get seller's orders
// @access  Private (Seller only)
router.get('/orders', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate
    } = req.query;

    // Get seller's product IDs
    const sellerProductIds = await Product.find({ 
      seller: req.user._id 
    }).distinct('_id');

    // Build filter
    const filter = { 
      'items.product': { $in: sellerProductIds }
    };
    
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
      .populate('user', 'name email phone')
      .populate('items.product', 'name images seller')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter orders to only include items from this seller
    const filteredOrders = orders.map(order => ({
      ...order.toObject(),
      items: order.items.filter(item => 
        item.product.seller.toString() === req.user._id.toString()
      )
    })).filter(order => order.items.length > 0);

    const total = await Order.countDocuments(filter);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        orders: filteredOrders,
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
    console.error('Get seller orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// @route   GET /api/sellers/orders/:id
// @desc    Get single order details
// @access  Private (Seller only)
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone shippingAddress')
      .populate('items.product', 'name images seller category sizes colors');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order contains products from this seller
    const hasSellerProducts = order.items.some(item => 
      item.product.seller.toString() === req.user._id.toString()
    );

    if (!hasSellerProducts) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This order does not contain your products'
      });
    }

    // Filter to show only seller's products
    const sellerOrder = {
      ...order.toObject(),
      items: order.items.filter(item => 
        item.product.seller.toString() === req.user._id.toString()
      )
    };

    res.json({
      success: true,
      data: { order: sellerOrder }
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order details'
    });
  }
});

// @route   PUT /api/sellers/orders/:id/status
// @desc    Update order status
// @access  Private (Seller only)
router.put('/orders/:id/status', async (req, res) => {
  try {
    const { status, trackingNumber, estimatedDelivery } = req.body;

    if (!['confirmed', 'processing', 'shipped', 'delivered'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order contains products from this seller
    const hasSellerProducts = order.items.some(item => {
      // We need to populate the product to check the seller
      return Product.findById(item.product).then(product => 
        product && product.seller.toString() === req.user._id.toString()
      );
    });

    if (!await hasSellerProducts) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This order does not contain your products'
      });
    }

    // Update order status
    order.status = status;
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    if (estimatedDelivery) {
      order.estimatedDelivery = new Date(estimatedDelivery);
    }

    if (status === 'delivered') {
      order.actualDelivery = new Date();
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
});

// @route   GET /api/sellers/analytics
// @desc    Get seller analytics
// @access  Private (Seller only)
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query; // Default to last 30 days
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get seller's product IDs
    const sellerProductIds = await Product.find({ 
      seller: req.user._id 
    }).distinct('_id');

    // Get orders in the period
    const orders = await Order.find({
      'items.product': { $in: sellerProductIds },
      createdAt: { $gte: startDate }
    }).populate('items.product');

    // Calculate analytics
    const totalRevenue = orders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((total, order) => {
        const sellerItemsTotal = order.items
          .filter(item => item.product.seller.toString() === req.user._id.toString())
          .reduce((sum, item) => sum + item.price, 0);
        return total + sellerItemsTotal;
      }, 0);

    const totalOrders = orders.length;
    const uniqueCustomers = new Set(orders.map(order => order.user.toString())).size;

    // Top selling products
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product.seller.toString() === req.user._id.toString()) {
          const productId = item.product._id.toString();
          if (!productSales[productId]) {
            productSales[productId] = {
              product: item.product,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productId].quantity += item.quantity;
          productSales[productId].revenue += item.price * item.quantity;
        }
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Daily sales data
    const dailySales = {};
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailySales[dateStr] = { orders: 0, revenue: 0 };
    }

    orders.forEach(order => {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (dailySales[dateStr]) {
        dailySales[dateStr].orders += 1;
        if (order.paymentStatus === 'paid') {
          const sellerRevenue = order.items
            .filter(item => item.product.seller.toString() === req.user._id.toString())
            .reduce((sum, item) => sum + item.price, 0);
          dailySales[dateStr].revenue += sellerRevenue;
        }
      }
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          uniqueCustomers,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        },
        topProducts,
        dailySales: Object.entries(dailySales)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, data]) => ({ date, ...data }))
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
});

module.exports = router;
