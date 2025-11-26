import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  X, 
  Trash2, 
  ArrowRight
} from 'lucide-react';

const Cart = () => {
  const { isAuthenticated } = useAuth();
  const { cart, loadCart, updateCartItem, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    loadCart();
    setLoading(false);
  }, [isAuthenticated, navigate, loadCart]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    setError('');
    
    const result = await updateCartItem(itemId, newQuantity);
    if (!result.success) {
      setError(result.error);
    }
    
    setUpdating(prev => ({ ...prev, [itemId]: false }));
  };

  const handleRemoveItem = async (itemId) => {
    setUpdating(prev => ({ ...prev, [itemId]: true }));
    setError('');
    
    const result = await removeFromCart(itemId);
    if (!result.success) {
      setError(result.error);
    }
    
    setUpdating(prev => ({ ...prev, [itemId]: false }));
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) return;
    
    const result = await clearCart();
    if (!result.success) {
      setError(result.error);
    }
  };

  const calculateItemPrice = (item) => {
    const price = item.type === 'rental' 
      ? item.product.price.rental[item.rentalPeriod] || 0
      : item.product.price.purchase;
    return price * item.quantity;
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + calculateItemPrice(item), 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 5000 ? 0 : subtotal > 0 ? 100 : 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleCheckoutWithRazorpay = () => {
    navigate('/razorpay-payment');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="festive-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600">
            Review and manage your selected items
          </p>
        </div>

        {error && (
          <div className="alert-error mb-6">
            {error}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-6">
              Start shopping to add items to your cart
            </p>
            <Link
              to="/products"
              className="btn-festive inline-flex items-center px-6 py-3"
            >
              <ShoppingBag size={20} className="mr-2" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm">
                {/* Cart Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Cart Items ({cart.length})
                    </h2>
                    <button
                      onClick={handleClearCart}
                      className="text-red-500 hover:text-red-600 text-sm font-medium"
                    >
                      <Trash2 size={16} className="inline mr-1" />
                      Clear Cart
                    </button>
                  </div>
                </div>

                {/* Cart Items List */}
                <div className="divide-y divide-gray-200">
                  {cart.map((item) => (
                    <div key={item._id} className="p-6 cart-item-enter">
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={item.product.images[0]?.url || 'https://via.placeholder.com/100x100'}
                            alt={item.product.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <div className="flex justify-between mb-2">
                            <Link
                              to={`/products/${item.product._id}`}
                              className="text-lg font-medium text-gray-900 hover:text-orange-500 transition-colors"
                            >
                              {item.product.name}
                            </Link>
                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              disabled={updating[item._id]}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              {updating[item._id] ? (
                                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <X size={20} />
                              )}
                            </button>
                          </div>

                          <p className="text-gray-600 text-sm mb-2">
                            {item.product.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              Size: {item.size}
                            </span>
                            {item.type === 'rental' && (
                              <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Rental: {item.rentalPeriod}
                              </span>
                            )}
                            <span className="text-sm bg-green-100 text-green-700 px-2 py-1 rounded">
                              {item.type === 'rental' ? 'Rental' : 'Purchase'}
                            </span>
                          </div>

                          {/* Price and Quantity */}
                          <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                                disabled={updating[item._id] || item.quantity <= 1}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                              >
                                <Minus size={16} />
                              </button>
                              <span className="w-12 text-center font-medium">
                                {updating[item._id] ? '...' : item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                                disabled={updating[item._id]}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="text-lg font-semibold text-gray-900">
                                ₹{calculateItemPrice(item).toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                ₹{item.type === 'rental' 
                                  ? item.product.price.rental[item.rentalPeriod] || 0
                                  : item.product.price.purchase
                                } each
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-4">
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
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold text-gray-900">
                      <span>Total</span>
                      <span>₹{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="btn-festive w-full py-3 text-center font-semibold mb-4 inline-block"
                >
                  Proceed to Checkout
                  <ArrowRight size={18} className="inline ml-2" />
                </Link>

                <Link
                  to="/products"
                  className="w-full py-3 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors inline-block"
                >
                  Continue Shopping
                </Link>

                {/* Promo Code */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Have a promo code?
                  </h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Enter code"
                      className="flex-1 form-input text-sm"
                    />
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
                      Apply
                    </button>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                    <span>Secure Checkout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Checkout Section */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Order Summary</h3>
          
          {/* Price Details */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>₹{calculateSubtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping:</span>
              <span>₹{calculateShipping()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax:</span>
              <span>₹{0}</span>
            </div>
            <hr />
            <div className="flex justify-between text-xl font-bold">
              <span>Total:</span>
              <span className="text-orange-600">₹{calculateTotal().toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3">Select Payment Method</label>
            <div className="space-y-2">
              <button
                onClick={handleCheckoutWithRazorpay}
                className="w-full flex items-center justify-between p-4 border-2 border-orange-500 rounded-lg hover:bg-orange-50 transition font-semibold text-orange-600"
              >
                <span>Pay with Razorpay</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
