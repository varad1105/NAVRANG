import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CreditCard, 
  Shield, 
  CheckCircle, 
  ArrowLeft,
  Calendar,
  Lock
} from 'lucide-react';

const DemoPayment = () => {
  const { orderId } = useParams();
  const { api } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState(null);
  const [paymentData, setPaymentData] = useState({
    cardNumber: '4532 1234 5678 9012',
    expiryDate: '12/25',
    cvv: '123',
    cardholderName: 'Demo User'
  });

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data.data.order);
    } catch (error) {
      console.error('Failed to load order:', error);
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // Simulate payment processing
    setTimeout(async () => {
      try {
        // Demo payment always succeeds
        const response = await api.post(`/orders/${orderId}/payment`, {
          paymentMethod: 'demo',
          paymentData: {
            ...paymentData,
            transactionId: 'DEMO_' + Date.now(),
            status: 'success'
          }
        });

        navigate('/payment/success', { 
          state: { 
            orderId: orderId,
            transactionId: 'DEMO_' + Date.now(),
            amount: order.totalAmount
          }
        });
      } catch (error) {
        navigate('/payment/failed', { 
          state: { 
            orderId: orderId,
            error: error.response?.data?.message || 'Payment failed'
          }
        });
      }
    }, 3000); // 3 second demo processing time
  };

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="festive-spinner"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">The order you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/orders')}
            className="btn-festive"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/checkout')}
            className="inline-flex items-center text-orange-500 hover:text-orange-600 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Checkout
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Demo Payment
          </h1>
          <p className="text-gray-600">
            Complete your payment securely (Demo Mode)
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center mb-6">
              <Shield className="text-green-500 mr-2" size={24} />
              <span className="text-lg font-semibold text-gray-900">Secure Payment</span>
              <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                DEMO MODE
              </span>
            </div>

            {processing ? (
              <div className="text-center py-12">
                <div className="festive-spinner mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Processing Payment...
                </h3>
                <p className="text-gray-600">
                  Please wait while we process your demo payment
                </p>
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    🎭 This is a demo payment. No real money will be charged.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                {/* Demo Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="text-yellow-600 mr-2" size={20} />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Demo Payment Mode</h4>
                      <p className="text-sm text-yellow-700">
                        This is a demonstration. No real payment will be processed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CreditCard size={16} className="inline mr-1" />
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={paymentData.cardNumber}
                    onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                    className="form-input w-full"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar size={16} className="inline mr-1" />
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={paymentData.expiryDate}
                      onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      className="form-input w-full"
                      placeholder="MM/YY"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Lock size={16} className="inline mr-1" />
                      CVV
                    </label>
                    <input
                      type="text"
                      value={paymentData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value)}
                      className="form-input w-full"
                      placeholder="123"
                      maxLength={3}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={paymentData.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                    className="form-input w-full"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn-festive w-full py-3 text-center font-semibold"
                >
                  Pay ₹{order.totalAmount.toLocaleString()} (Demo)
                </button>

                <div className="text-center text-sm text-gray-500">
                  <Lock size={14} className="inline mr-1" />
                  Your payment information is secure and encrypted
                </div>
              </form>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 mb-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <img
                    src={item.image || 'https://via.placeholder.com/50x50'}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.quantity}x {item.size}
                    </p>
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ₹{item.price.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{(order.totalAmount - (order.shippingCost || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {(order.shippingCost || 0) === 0 ? 'Free' : `₹${order.shippingCost}`}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2">
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>₹{order.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
              <p className="text-sm text-gray-600">
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                {order.shippingAddress.pincode}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPayment;
