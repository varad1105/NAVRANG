const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid amount' 
      });
    }

    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        userId: req.user?.id || 'unknown',
        ...notes
      }
    };

    const order = await razorpay.orders.create(options);

    return res.json({
      success: true,
      order,
      key_id: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create order',
      error: error.message 
    });
  }
});

// Verify Payment
router.post('/verify-payment', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required payment details' 
      });
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payment verification failed' 
      });
    }

    return res.json({
      success: true,
      message: 'Payment verified successfully',
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Verification failed',
      error: error.message 
    });
  }
});

// Get Payment Details
router.get('/payment/:payment_id', auth, async (req, res) => {
  try {
    if (!req.params.payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const payment = await razorpay.payments.fetch(req.params.payment_id);
    
    return res.json({
      success: true,
      payment
    });
  } catch (error) {
    console.error('Fetch payment error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment',
      error: error.message 
    });
  }
});

module.exports = router;
