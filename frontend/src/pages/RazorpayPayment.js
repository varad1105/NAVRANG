import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RazorpayPayment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Step 1: Create order on backend
      const { data } = await axios.post(
        'http://192.168.0.102:5000/api/razorpay/create-order',
        {
          amount: parseFloat(amount),
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          notes: {
            email,
            phone
          }
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!data.success) {
        setError('Failed to create order');
        setLoading(false);
        return;
      }

      // Step 2: Initialize Razorpay checkout
      const options = {
        key: data.key_id,
        amount: Math.round(parseFloat(amount) * 100),
        currency: 'INR',
        name: 'Navrang Navratri',
        description: 'E-Commerce Payment',
        order_id: data.order.id,
        handler: async (response) => {
          try {
            // Step 3: Verify payment on backend
            const verifyResponse = await axios.post(
              'http://192.168.0.102:5000/api/razorpay/verify-payment',
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('token')}`
                }
              }
            );

            if (verifyResponse.data.success) {
              setSuccess('Payment Successful!');
              setTimeout(() => {
                navigate('/payment-success', { 
                  state: { 
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id
                  }
                });
              }, 2000);
            }
          } catch (err) {
            setError('Payment verification failed');
            navigate('/payment-failed');
          }
        },
        prefill: {
          email,
          contact: phone
        },
        theme: {
          color: '#F37254'
        },
        modal: {
          ondismiss: () => {
            setError('Payment cancelled');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment initiation failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Navrang</h1>
            <p className="text-orange-100">Secure Payment Gateway</p>
          </div>

          {/* Form Container */}
          <div className="p-8">
            {/* Success Alert */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <p className="text-green-700 font-semibold">✓ {success}</p>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                <p className="text-red-700 font-semibold">✗ {error}</p>
              </div>
            )}

            <form onSubmit={handlePayment} className="space-y-5">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit number"
                  pattern="[0-9]{10}"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 transition"
                />
              </div>

              {/* Amount Display */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Total Amount:</span>
                  <span className="text-2xl font-bold text-orange-500">
                    ₹{amount || '0'}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !amount || !email || !phone}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay ₹${amount || '0'} with Razorpay`
                )}
              </button>

              {/* Back Button */}
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full text-gray-600 font-semibold py-3 rounded-lg hover:bg-gray-100 transition"
              >
                Back to Cart
              </button>
            </form>

            {/* Security Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-4">
                Your payment is secured with 256-bit encryption
              </p>
              <div className="flex justify-center space-x-4">
                <span className="text-xs text-gray-400">🔒 SSL Secure</span>
                <span className="text-xs text-gray-400">✓ PCI DSS</span>
                <span className="text-xs text-gray-400">🛡️ Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Test Card: 4111 1111 1111 1111 | Any Future Date | Any CVV
        </p>
      </div>
    </div>
  );
};

export default RazorpayPayment;
