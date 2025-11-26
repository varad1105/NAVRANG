import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import DeliveryStatus from '../components/DeliveryStatus';

import { 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MapPin,
  ArrowLeft,
  Download
} from 'lucide-react';

const OrderDetail = () => {
  const { id } = useParams();
  const { api, isAuthenticated, user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch order
  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.data.order);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchOrderDetail();
  }, [id, isAuthenticated]);

  // Icons
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <AlertCircle size={20} className="text-yellow-500" />;
      case 'confirmed': return <Package size={20} className="text-blue-500" />;
      case 'shipped': return <Truck size={20} className="text-purple-500" />;
      case 'delivered': return <CheckCircle size={20} className="text-green-500" />;
      case 'cancelled': return <XCircle size={20} className="text-red-500" />;
      default: return <Package size={20} className="text-gray-500" />;
    }
  };

  // Badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Receipt Download
  const downloadReceipt = async () => {
    try {
      const response = await api.get(`/orders/${id}/receipt`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${order.orderNumber}.pdf`;
      a.click();
    } catch (error) {
      setError('Failed to download receipt');
    }
  };

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">Login to view your order details</p>
          <Link to="/login" className="btn-festive">Login</Link>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="festive-spinner"></div>
      </div>
    );
  }

  // No order found
  if (error && !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/orders" className="btn-festive">Back to Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <Link to="/orders" className="inline-flex items-center text-orange-500 mb-4">
          <ArrowLeft size={20} className="mr-2" /> Back to Orders
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>

        <div className="flex items-center mt-2 space-x-3">
          {getStatusIcon(order.status)}
          <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(order.status)}`}>
            {order.status.toUpperCase()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">

          {/* ========== Order Items + Address ========== */}
          <div className="md:col-span-2 space-y-6">

            {/* Order Items */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4">Order Items</h2>

              {order.items.map((item, i) => (
                <div key={i} className="flex gap-4 py-4 border-b last:border-0">
                  <img src={item.image} className="w-20 h-20 object-cover rounded" />

                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Size: {item.size} • Qty: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.type === 'rental' ? `Rental (${item.rentalPeriod})` : 'Purchase'}
                    </p>
                  </div>

                  <p className="font-medium text-gray-800">₹{item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin size={20} className="mr-2" /> Shipping Address
              </h2>

              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p>Pincode: {order.shippingAddress.pincode}</p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </div>
          </div>

          {/* ========== Summary + Delivery Status ========== */}
          <div className="space-y-6">

            {/* Summary */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Order Summary</h3>

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>

              <div className="border-t mt-3 pt-3 font-semibold flex justify-between">
                <span>Total</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>

              <button onClick={downloadReceipt} className="w-full mt-4 btn-festive py-2 flex items-center justify-center">
                <Download size={16} className="mr-2" />
                Download Receipt
              </button>
            </div>

            {/* DeliveryStatus Component */}
            <DeliveryStatus 
              order={order} 
              isAdmin={user?.role === 'admin'} 
              onStatusUpdate={fetchOrderDetail}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
