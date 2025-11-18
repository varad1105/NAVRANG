const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/cart
// @desc    Get user's cart
// @access  Private
router.get('/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    
    res.json({
      success: true,
      data: { cart: user.cart }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart'
    });
  }
});

// @route   POST /api/users/cart
// @desc    Add item to cart
// @access  Private
router.post('/cart', protect, [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('size').isIn(['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL']).withMessage('Invalid size'),
  body('type').isIn(['purchase', 'rental']).withMessage('Type must be purchase or rental'),
  body('rentalPeriod').optional().isIn(['3-days', '7-days', '15-days']).withMessage('Invalid rental period')
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

    const { productId, quantity, size, type, rentalPeriod } = req.body;

    // Check if product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if size is available
    if (!product.sizes.includes(size)) {
      return res.status(400).json({
        success: false,
        message: 'Selected size is not available'
      });
    }

    // Check if rental period is specified for rental
    if (type === 'rental') {
      if (!product.availability.rental) {
        return res.status(400).json({
          success: false,
          message: 'This product is not available for rental'
        });
      }
      if (!rentalPeriod) {
        return res.status(400).json({
          success: false,
          message: 'Rental period is required for rental items'
        });
      }
    }

    const user = await User.findById(req.user._id);

    // Check if item already exists in cart
    const existingItemIndex = user.cart.findIndex(
      item => item.product.toString() === productId && item.size === size && item.type === type
    );

    if (existingItemIndex > -1) {
      // Update existing item
      user.cart[existingItemIndex].quantity += quantity;
      if (type === 'rental' && rentalPeriod) {
        user.cart[existingItemIndex].rentalPeriod = rentalPeriod;
      }
    } else {
      // Add new item
      user.cart.push({
        product: productId,
        quantity,
        size,
        type,
        rentalPeriod: type === 'rental' ? rentalPeriod : undefined
      });
    }

    await user.save();
    await user.populate('cart.product');

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: { cart: user.cart }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to cart'
    });
  }
});

// @route   PUT /api/users/cart/:itemId
// @desc    Update cart item
// @access  Private
router.put('/cart/:itemId', protect, [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
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

    const { quantity } = req.body;
    const user = await User.findById(req.user._id);

    const cartItem = user.cart.id(req.params.itemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    cartItem.quantity = quantity;
    await user.save();
    await user.populate('cart.product');

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: { cart: user.cart }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating cart'
    });
  }
});

// @route   DELETE /api/users/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/cart/:itemId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const cartItem = user.cart.id(req.params.itemId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    user.cart.pull(req.params.itemId);
    await user.save();
    await user.populate('cart.product');

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: { cart: user.cart }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from cart'
    });
  }
});

// @route   DELETE /api/users/cart
// @desc    Clear cart
// @access  Private
router.delete('/cart', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = [];
    await user.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: { cart: [] }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart'
    });
  }
});

// @route   GET /api/users/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    
    res.json({
      success: true,
      data: { wishlist: user.wishlist }
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist'
    });
  }
});

// @route   POST /api/users/wishlist
// @desc    Add item to wishlist
// @access  Private
router.post('/wishlist', protect, [
  body('productId').isMongoId().withMessage('Invalid product ID')
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

    const { productId } = req.body;

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const user = await User.findById(req.user._id);

    // Check if item already exists in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    user.wishlist.push(productId);
    await user.save();
    await user.populate('wishlist');

    res.json({
      success: true,
      message: 'Product added to wishlist successfully',
      data: { wishlist: user.wishlist }
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to wishlist'
    });
  }
});

// @route   DELETE /api/users/wishlist/:productId
// @desc    Remove item from wishlist
// @access  Private
router.delete('/wishlist/:productId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.wishlist.includes(req.params.productId)) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    user.wishlist.pull(req.params.productId);
    await user.save();
    await user.populate('wishlist');

    res.json({
      success: true,
      message: 'Product removed from wishlist successfully',
      data: { wishlist: user.wishlist }
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from wishlist'
    });
  }
});

// @route   POST /api/users/addresses
// @desc    Add new address
// @access  Private
router.post('/addresses', protect, [
  body('street').trim().notEmpty().withMessage('Street address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('pincode').matches(/^[0-9]{6}$/).withMessage('Please provide a valid 6-digit pincode'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean')
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

    const { street, city, state, pincode, isDefault } = req.body;
    const user = await User.findById(req.user._id);

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({
      street,
      city,
      state,
      pincode,
      isDefault: isDefault || false
    });

    await user.save();

    res.json({
      success: true,
      message: 'Address added successfully',
      data: { addresses: user.addresses }
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding address'
    });
  }
});

// @route   PUT /api/users/addresses/:addressId
// @desc    Update address
// @access  Private
router.put('/addresses/:addressId', protect, [
  body('street').optional().trim().notEmpty().withMessage('Street address cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('pincode').optional().matches(/^[0-9]{6}$/).withMessage('Please provide a valid 6-digit pincode'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be a boolean')
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

    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const { street, city, state, pincode, isDefault } = req.body;

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Update address fields
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;
    if (isDefault !== undefined) address.isDefault = isDefault;

    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { addresses: user.addresses }
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating address'
    });
  }
});

// @route   DELETE /api/users/addresses/:addressId
// @desc    Delete address
// @access  Private
router.delete('/addresses/:addressId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    user.addresses.pull(req.params.addressId);
    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully',
      data: { addresses: user.addresses }
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting address'
    });
  }
});

module.exports = router;
