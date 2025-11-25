# Razorpay Payment Integration Setup Guide

This guide will help you set up Razorpay payment integration for the NAVRANG e-commerce application.

## Prerequisites

1. Razorpay Account (Test Mode)
2. Test API Keys from Razorpay Dashboard

## Setup Instructions

### 1. Get Razorpay API Keys

1. Sign up/login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to Settings → API Keys
3. Generate Test API Keys
4. Note down the Key ID and Key Secret

### 2. Configure Backend Environment Variables

Add the following to your `backend/.env` file:

```env
# Razorpay Configuration (Test Mode)
RAZORPAY_KEY_ID=your_test_key_id_here
RAZORPAY_KEY_SECRET=your_test_key_secret_here
```

Replace `your_test_key_id_here` and `your_test_key_secret_here` with your actual Razorpay test keys.

### 3. Backend Setup

The backend has been configured with:
- Razorpay SDK installed (`npm install razorpay`)
- New routes in `backend/routes/razorpay.js`:
  - `POST /api/razorpay/create-order` - Creates Razorpay order
  - `POST /api/razorpay/verify-payment` - Verifies payment signature
  - `POST /api/razorpay/payment-failed` - Handles payment failures
- Order model updated to store Razorpay payment details

### 4. Frontend Setup

The frontend has been configured with:
- Razorpay checkout script added to `public/index.html`
- New payment page `frontend/src/pages/RazorpayPayment.js`
- Updated checkout flow to include Razorpay option
- Buy Now button defaults to Razorpay payment

## Features Implemented

### Payment Methods Available
- Credit/Debit Cards
- UPI (Google Pay, PhonePe, Paytm)
- Net Banking
- Wallets

### Security Features
- Payment signature verification
- Encrypted payment processing
- No card details stored on server
- Test mode for development

### User Experience
- Seamless checkout flow
- Mobile-friendly payment interface
- Real-time payment status updates
- Error handling and retry options

## Testing Instructions

### Test Card Details
Use these test card details for testing payments:

```
Card Number: 4111 1111 1111 1111
Expiry Date: Any future date (e.g., 12/25)
CVV: Any 3 digits (e.g., 123)
OTP: 123456
```

### Test UPI
- Use any UPI ID format (e.g., test@ybl)
- OTP: 123456

### Test Net Banking
- Select any test bank from the list
- Use test credentials provided by Razorpay

## How It Works

1. **Order Creation**: User selects Razorpay at checkout
2. **Razorpay Order**: Backend creates Razorpay order with amount
3. **Payment Modal**: Frontend opens Razorpay checkout modal
4. **Payment Processing**: User completes payment in Razorpay modal
5. **Verification**: Backend verifies payment signature
6. **Order Confirmation**: Order status updated to confirmed

## Production Deployment

For production deployment:

1. Switch to Live Mode in Razorpay Dashboard
2. Generate Live API Keys
3. Update environment variables with live keys
4. Ensure HTTPS is enabled on your domain
5. Update CORS settings in `backend/server.js`

## Error Handling

The integration includes comprehensive error handling:
- Payment failures are logged and user is notified
- Orders are marked as failed if payment doesn't complete
- Users can retry failed payments
- Automatic timeout handling

## Support

For issues:
1. Check Razorpay dashboard for transaction logs
2. Verify API keys are correctly configured
3. Ensure backend is running and accessible
4. Check browser console for frontend errors

## Security Notes

- Never expose Razorpay Key Secret in frontend code
- Always verify payment signatures on backend
- Use HTTPS in production
- Implement proper rate limiting
- Log all payment transactions for audit
