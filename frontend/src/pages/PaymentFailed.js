import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowRight, CreditCard, RefreshCw } from 'lucide-react';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const reason = searchParams.get('reason') || 'Payment could not be processed';

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          {/* Failed Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle size={40} className="text-red-500" />
            </div>
          </div>

          {/* Failed Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Failed
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {reason}. Please try again or contact support if the problem persists.
          </p>

          {/* Order Details */}
          {orderId && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Information</h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Order ID:</span> #{orderId}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span> 
                  <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                    Payment Failed
                  </span>
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Action Required:</span> Please retry payment
                </p>
              </div>
            </div>
          )}

          {/* Troubleshooting */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Troubleshooting Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
                  <CreditCard size={20} className="text-yellow-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Check Payment Details</h3>
                <p className="text-sm text-gray-600">
                  Ensure your card details are correct and have sufficient funds
                </p>
              </div>
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                  <RefreshCw size={20} className="text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Try Different Payment</h3>
                <p className="text-sm text-gray-600">
                  Use a different payment method or try again later
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={`/payment/${orderId}`}
              className="btn-festive px-8 py-3 text-center font-semibold inline-flex items-center justify-center"
            >
              <RefreshCw size={18} className="mr-2" />
              Retry Payment
            </Link>
            <Link
              to="/cart"
              className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-center font-medium inline-flex items-center justify-center"
            >
              <ArrowRight size={18} className="mr-2" />
              Back to Cart
            </Link>
          </div>

          {/* Contact Support */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-4">Still having trouble? We're here to help!</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/contact"
                className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium"
              >
                Contact Support
              </Link>
              <span className="text-gray-400">•</span>
              <span className="text-sm text-gray-600">
                Email: support@navrang.com | Phone: +91 98765 43210
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
