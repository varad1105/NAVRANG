import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      try {
        const { paymentId } = location.state || {};
        if (!paymentId) {
          navigate('/');
          return;
        }

        const { data } = await axios.get(
          `http://localhost:5000/api/razorpay/payment/${paymentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        setPaymentDetails(data.payment);
      } catch (err) {
        console.error('Error fetching payment details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-12 text-center">
            <div className="mb-4 text-6xl">✓</div>
            <h1 className="text-3xl font-bold text-white">Payment Successful!</h1>
            <p className="text-green-100 mt-2">Your transaction has been completed</p>
          </div>

          {/* Details */}
          <div className="p-8">
            {loading ? (
              <div className="text-center py-8">Loading details...</div>
            ) : paymentDetails ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-mono text-sm font-semibold">{paymentDetails.id}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Amount:</span>
                  <span className="text-xl font-bold text-green-600">
                    ₹{(paymentDetails.amount / 100).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Status:</span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    {paymentDetails.status}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-semibold capitalize">{paymentDetails.method}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-semibold">
                    {new Date(paymentDetails.created_at * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Buttons */}
            <div className="mt-8 space-y-3">
              <button
                onClick={() => navigate('/orders')}
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition"
              >
                View Your Orders
              </button>

              <button
                onClick={() => navigate('/')}
                className="w-full text-green-600 font-semibold py-3 rounded-lg hover:bg-green-50 transition"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
