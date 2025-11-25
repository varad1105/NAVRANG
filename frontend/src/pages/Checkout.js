import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  Shield,
  MapPin,
  User,
  Phone,
  Mail,
  Smartphone
} from 'lucide-react';

const Checkout = () => {
  const { user, isAuthenticated, api } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState({
    items: [],
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      phone: ''
    },
    paymentMethod: 'cod'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      navigate('/cart');
      return;
    }

    // Set default payment method from location state (for Buy Now)
    if (location.state?.defaultPaymentMethod) {
      setOrderData(prev => ({
        ...prev,
        paymentMethod: location.state.defaultPaymentMethod
      }));
    }

    // Pre-fill order data with cart items
    const orderItems = cart.map(item => ({
      product: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      size: item.size,
      color: item.color || (item.product.colors && item.product.colors[0]) || 'Default',
      price: item.type === 'rental' 
        ? item.product.price.rental[item.rentalPeriod] * item.quantity
        : item.product.price.purchase * item.quantity,
      type: item.type,
      rentalPeriod: item.rentalPeriod,
      image: item.product.images[0]?.url
    }));

    setOrderData(prev => ({
      ...prev,
      items: orderItems,
      shippingAddress: {
        ...prev.shippingAddress,
        phone: user.phone || ''
      }
    }));
  }, [isAuthenticated, navigate, cart, user, location.state]);

  const calculateSubtotal = () => {
    return orderData.items.reduce((total, item) => total + item.price, 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 5000 ? 0 : subtotal > 0 ? 100 : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleAddressChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const { shippingAddress } = orderData;
    
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode || !shippingAddress.phone) {
      setError('Please fill in all shipping address fields');
      return false;
    }

    // Extract 6-digit pincode from the input (handles formats like "pune-15", "411015", etc.)
    const pincodeMatch = shippingAddress.pincode.match(/\d{6}/);
    if (!pincodeMatch) {
      setError('Please enter a valid 6-digit pincode');
      return false;
    }

    // Extract 10-digit phone number from the input
    const phoneMatch = shippingAddress.phone.match(/\d{10}/);
    if (!phoneMatch) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    // Update the fields with cleaned values
    setOrderData(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        pincode: pincodeMatch[0],
        phone: phoneMatch[0]
      }
    }));

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const orderRequest = {
        ...orderData,
        totalAmount: calculateTotal()
      };
      console.log('📦 Sending order data:', orderRequest);
      const response = await api.post('/orders', orderRequest);
      console.log('✅ Order created:', response.data);

      // Clear cart after successful order
      await clearCart();

      // Redirect to order confirmation or payment
      if (orderData.paymentMethod === 'cod') {
        navigate(`/orders/${response.data.data.order._id}`);
      } else if (orderData.paymentMethod === 'demo') {
        navigate(`/payment/${response.data.data.order._id}`);
      } else if (orderData.paymentMethod === 'razorpay') {
        navigate(`/razorpay-payment/${response.data.data.order._id}`);
      } else {
        navigate(`/payment/${response.data.data.order._id}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || cart.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center text-orange-500 hover:text-orange-600 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          <p className="text-gray-600">
            Complete your order details to proceed
          </p>
        </div>

        {error && (
          <div className="alert-error mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <User size={16} className="inline mr-1" />
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user.name}
                      disabled
                      className="form-input w-full bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail size={16} className="inline mr-1" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="form-input w-full bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <MapPin size={20} className="inline mr-2" />
                Shipping Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={orderData.shippingAddress.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    className="form-input w-full"
                    placeholder="123, Festival Street"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={orderData.shippingAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className="form-input w-full"
                      placeholder="Navrati Nagar"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={orderData.shippingAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className="form-input w-full"
                      placeholder="Gujarat"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={orderData.shippingAddress.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      className="form-input w-full"
                      placeholder="380001"
                      maxLength={6}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} className="inline mr-1" />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={orderData.shippingAddress.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      className="form-input w-full"
                      placeholder="9876543210"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                <CreditCard size={20} className="inline mr-2" />
                Payment Method
              </h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={orderData.paymentMethod === 'cod'}
                    onChange={(e) => setOrderData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Truck size={16} className="text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Cash on Delivery</div>
                      <div className="text-sm text-gray-500">Pay when you receive your order</div>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="online"
                    checked={orderData.paymentMethod === 'online'}
                    onChange={(e) => setOrderData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <CreditCard size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Online Payment</div>
                      <div className="text-sm text-gray-500">Credit/Debit Card, UPI, Net Banking</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={orderData.paymentMethod === 'razorpay'}
                    onChange={(e) => setOrderData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <Smartphone size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Razorpay</div>
                      <div className="text-sm text-gray-500">Credit/Debit Card, UPI, Net Banking, Wallets</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="demo"
                    checked={orderData.paymentMethod === 'demo'}
                    onChange={(e) => setOrderData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <Shield size={16} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Demo Payment</div>
                      <div className="text-sm text-gray-500">Test our payment system (demo mode)</div>
                    </div>
                  </div>
                </label>
              </div>

              {/* Payment Security Notice */}
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start">
                  <Shield size={16} className="text-green-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-green-900">Secure Payment</h4>
                    <p className="text-xs text-green-700 mt-1">
                      Your payment information is encrypted and secure. We never store your card details.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Order Summary
              </h2>

              {/* Order Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <img
                      src={item.image || 'https://via.placeholder.com/50x50'}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.quantity}x {item.size} {item.type === 'rental' ? `(${item.rentalPeriod})` : ''}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ₹{item.price.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{calculateSubtotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>
                    {calculateShipping() === 0 ? 'Free' : `₹${calculateShipping()}`}
                  </span>
                </div>
                {calculateShipping() === 0 && calculateSubtotal() > 0 && (
                  <div className="text-green-600 text-sm">
                    🎉 Free shipping on orders above ₹5000
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>Total</span>
                    <span>₹{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-festive w-full py-3 text-center font-semibold mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="festive-spinner w-5 h-5 mr-2"></div>
                    Placing Order...
                  </div>
                ) : (
                  'Place Order'
                )}
              </button>

              {/* Security Badge */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <Shield size={16} />
                  <span>Secure Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
