import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={40} className="text-green-500" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase. Your order has been confirmed.
          </p>

          {/* Order Details */}
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Order ID:</span> #{orderId}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span> 
                  <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Confirmed
                  </span>
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Payment:</span> 
                  <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    Paid
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">What's Next?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                  <ShoppingBag size={20} className="text-orange-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Track Your Order</h3>
                <p className="text-sm text-gray-600">
                  Monitor your order status in real-time through your account
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <ArrowRight size={20} className="text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Delivery Updates</h3>
                <p className="text-sm text-gray-600">
                  Receive notifications about your order delivery
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Customer Support</h3>
                <p className="text-sm text-gray-600">
                  Need help? Our support team is here to assist you
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={`/orders/${orderId}`}
              className="btn-festive px-8 py-3 text-center font-semibold inline-flex items-center justify-center"
            >
              View Order Details
              <ArrowRight size={18} className="ml-2" />
            </Link>
            <Link
              to="/orders"
              className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-center font-medium inline-flex items-center justify-center"
            >
              View All Orders
            </Link>
          </div>

          {/* Continue Shopping */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-4">Continue your festive shopping journey</p>
            <Link
              to="/products"
              className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium"
            >
              <ShoppingBag size={18} className="mr-2" />
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
