const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Newsletter = require('../models/newsletter');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().isIn(['men', 'women', 'kids', 'accessories']).withMessage('Invalid category'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Minimum price must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Maximum price must be non-negative'),
  query('size').optional().isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL']).withMessage('Invalid size'),
  query('sortBy').optional().isIn(['price-low', 'price-high', 'newest', 'rating', 'popular']).withMessage('Invalid sort option')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      page = 1,
      limit = 12,
      category,
      subCategory,
      minPrice,
      maxPrice,
      size,
      color,
      search,
      sortBy = 'newest',
      availability
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (size) filter.sizes = size;
    if (color) filter.colors = { $regex: color, $options: 'i' };
    
    // Price filtering
    if (minPrice || maxPrice) {
      filter['price.purchase'] = {};
      if (minPrice) filter['price.purchase'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['price.purchase'].$lte = parseFloat(maxPrice);
    }

    // Availability filtering
    if (availability === 'purchase') {
      filter['availability.purchase'] = true;
    } else if (availability === 'rental') {
      filter['availability.rental'] = true;
    }

    // Search functionality
    if (search) {
      filter.$text = { $search: search };
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case 'price-low':
        sort['price.purchase'] = 1;
        break;
      case 'price-high':
        sort['price.purchase'] = -1;
        break;
      case 'rating':
        sort['rating.average'] = -1;
        break;
      case 'popular':
        sort['rating.count'] = -1;
        break;
      case 'newest':
      default:
        sort.createdAt = -1;
        break;
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(filter)
      .populate('seller', 'name email')
      .sort(sort)
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
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
});

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ 
      isActive: true, 
      featured: true 
    })
    .populate('seller', 'name')
    .sort({ createdAt: -1 })
    .limit(8);

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured products'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email phone');

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
});

// @route   POST /api/products
// @desc    Create a new product (seller only)
// @access  Private (Seller only)
router.post('/', protect, authorize('seller'), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('category').isIn(['men', 'women', 'kids', 'accessories']).withMessage('Invalid category'),
  body('subCategory').isIn(['traditional-wear', 'fusion-wear', 'accessories', 'jewelry']).withMessage('Invalid sub-category'),
  body('price.purchase').isFloat({ min: 0 }).withMessage('Purchase price must be non-negative'),
  body('sizes').isArray({ min: 1 }).withMessage('At least one size is required'),
  body('colors').isArray({ min: 1 }).withMessage('At least one color is required'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const productData = {
      ...req.body,
      seller: req.user._id
    };

    const product = new Product(productData);
    await product.save();

    await product.populate('seller', 'name email');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating product'
    });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product (seller only)
// @access  Private (Seller only)
router.put('/:id', protect, authorize('seller'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if the product belongs to the current seller
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own products'
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('seller', 'name email');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product: updatedProduct }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (seller only)
// @access  Private (Seller only)
router.delete('/:id', protect, authorize('seller'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if the product belongs to the current seller
    if (product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own products'
      });
    }

    // Soft delete by setting isActive to false
    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
    });
  }
});

// @route   POST /api/products/:id/reviews
// @desc    Add a review to a product
// @access  Private
router.post('/:id/reviews', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const { rating, comment } = req.body;

    // Check if user has already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.date = new Date();
    } else {
      // Add new review
      product.reviews.push({
        user: req.user._id,
        rating,
        comment
      });
    }

    // Calculate new average rating
    const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.rating.average = Math.round((totalRating / product.reviews.length) * 10) / 10;
    product.rating.count = product.reviews.length;

    await product.save();

    await product.populate('reviews.user', 'name');

    res.json({
      success: true,
      message: 'Review added successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding review'
    });
  }
});

// Subscribe to newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email });

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({
          success: false,
          message: 'This email is already subscribed'
        });
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true;
        existingSubscriber.unsubscribedAt = null;
        existingSubscriber.subscribedAt = new Date();
        await existingSubscriber.save();

        return res.status(200).json({
          success: true,
          message: 'Successfully resubscribed to newsletter',
          data: existingSubscriber
        });
      }
    }

    // Create new subscriber
    const newSubscriber = await Newsletter.create({ email });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: newSubscriber
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to subscribe to newsletter'
    });
  }
});

// Unsubscribe from newsletter
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const subscriber = await Newsletter.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our newsletter'
      });
    }

    subscriber.isActive = false;
    subscriber.unsubscribedAt = new Date();
    await subscriber.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
      data: subscriber
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to unsubscribe from newsletter'
    });
  }
});

// Get all active subscribers (Admin only)
router.get('/subscribers', async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true }).sort({ subscribedAt: -1 });

    res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    console.error('Get subscribers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch subscribers'
    });
  }
});

module.exports = router;
