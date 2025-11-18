import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Heart, ShoppingBag, X, Star } from 'lucide-react';
import { getFirstValidSize } from '../utils/validation';

const Wishlist = () => {
  const { isAuthenticated, api } = useAuth();
  const { wishlist, loadWishlist, removeFromWishlist, addToCart, isInWishlist } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState({});

  useEffect(() => {
    if (!isAuthenticated) return;
    
    loadWishlist();
    setLoading(false);
  }, [isAuthenticated, loadWishlist]);

  const handleRemoveFromWishlist = async (productId) => {
    setRemoving(prev => ({ ...prev, [productId]: true }));
    setError('');
    
    const result = await removeFromWishlist(productId);
    if (!result.success) {
      setError(result.error);
    }
    
    setRemoving(prev => ({ ...prev, [productId]: false }));
  };

  const handleAddToCart = async (productId, size) => {
    // Validate and get a proper size
    const validSize = getFirstValidSize([size]);
    const result = await addToCart(productId, 1, validSize);
    if (!result.success) {
      setError(result.error);
    }
  };

  const StarRating = ({ rating, count }) => {
    return (
      <div className="flex items-center space-x-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">({count})</span>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to view your wishlist</p>
          <Link to="/login" className="btn-festive">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">Items you've saved for later</p>
        </div>

        {error && (
          <div className="alert-error mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="festive-spinner"></div>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Heart size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Wishlist is Empty</h2>
            <p className="text-gray-600 mb-6">Start adding items you love to your wishlist</p>
            <Link to="/products" className="btn-festive">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((product) => (
              <div key={product._id} className="festive-card bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative">
                  <Link to={`/products/${product._id}`}>
                    <img
                      src={product.images[0]?.url || 'https://via.placeholder.com/300x400'}
                      alt={product.name}
                      className="w-full h-64 object-cover"
                    />
                  </Link>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    disabled={removing[product._id]}
                    className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  >
                    {removing[product._id] ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <X size={16} className="text-red-500" />
                    )}
                  </button>
                </div>
                
                <div className="p-4">
                  <Link to={`/products/${product._id}`}>
                    <h3 className="font-semibold text-gray-900 mb-2 hover:text-orange-500 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="price-badge">
                      ₹{product.price.purchase}
                    </div>
                    <StarRating rating={Math.floor(product.rating.average)} count={product.rating.count} />
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-wrap gap-1">
                      {product.sizes.slice(0, 2).map((size) => (
                        <span key={size} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {size}
                        </span>
                      ))}
                      {product.sizes.length > 2 && (
                        <span className="text-xs text-gray-500">+{product.sizes.length - 2}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {product.stock} in stock
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/products/${product._id}`}
                      className="flex-1 bg-orange-500 text-white text-center py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                    >
                      View Details
                    </Link>
                    <button
                      onClick={() => handleAddToCart(product._id, getFirstValidSize(product.sizes))}
                      className="flex-1 bg-green-500 text-white text-center py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      <ShoppingBag size={14} className="inline mr-1" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
