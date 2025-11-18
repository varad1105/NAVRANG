import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useChat } from '../context/ChatContext';
import { 
  Heart, 
  Star, 
  ShoppingBag, 
  Minus, 
  Plus, 
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
  User,
  MessageSquare
} from 'lucide-react';
import { getFirstValidSize, getImageWithFallback } from '../utils/validation';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { api, isAuthenticated } = useAuth();
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const { startChat } = useChat();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedType, setSelectedType] = useState('purchase');
  const [selectedRentalPeriod, setSelectedRentalPeriod] = useState('3-days');
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      setProduct(response.data.data.product);
      
      // Set default selections
      if (response.data.data.product.sizes.length > 0) {
        const validSize = getFirstValidSize(response.data.data.product.sizes);
        setSelectedSize(validSize);
      }
      if (response.data.data.product.colors.length > 0) {
        setSelectedColor(response.data.data.product.colors[0]);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return;
    }

    if (!product) {
      setError('Product not available');
      return;
    }

    if (!selectedSize) {
      setError('Please select a size');
      return;
    }

    setAddingToCart(true);
    setError('');

    const cartData = {
      productId: product._id,
      quantity,
      size: selectedSize,
      type: selectedType,
      rentalPeriod: selectedType === 'rental' ? selectedRentalPeriod : null
    };

    const result = await addToCart(cartData.productId, cartData.quantity, cartData.size, cartData.type, cartData.rentalPeriod);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setAddingToCart(false);
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return;
    }

    if (!product) {
      setError('Product not available');
      return;
    }

    setAddingToWishlist(true);
    setError('');

    const result = await addToWishlist(product._id);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setAddingToWishlist(false);
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!product) {
      setError('Product not available');
      return;
    }

    setStartingChat(true);
    setError('');

    const result = await startChat(product._id, product.seller._id);
    
    if (result.success) {
      navigate('/chat');
    } else {
      setError(result.error);
    }
    
    setStartingChat(false);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!product) {
      setError('Product not available');
      return;
    }

    if (!selectedSize) {
      setError('Please select a size');
      return;
    }

    setBuyingNow(true);
    setError('');

    // Create a single-item cart and proceed to checkout
    const cartData = {
      productId: product._id,
      quantity,
      size: selectedSize,
      type: selectedType,
      rentalPeriod: selectedType === 'rental' ? selectedRentalPeriod : null
    };

    // Add to cart first
    const result = await addToCart(cartData.productId, cartData.quantity, cartData.size, cartData.type, cartData.rentalPeriod);
    
    if (result.success) {
      navigate('/checkout');
    } else {
      setError(result.error);
    }
    
    setBuyingNow(false);
  };

  const calculatePrice = () => {
    if (!product) return 0;
    if (selectedType === 'purchase') {
      return product.price.purchase * quantity;
    } else {
      return product.price.rental[selectedRentalPeriod] * quantity;
    }
  };

  const StarRating = ({ rating, count }) => {
    return (
      <div className="flex items-center space-x-1">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">({count} reviews)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="festive-spinner"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'Product not found'}</p>
          <Link to="/products" className="btn-festive">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-orange-500">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-orange-500">Products</Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        {error && (
          <div className="alert-error mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="aspect-square">
                <img
                  src={product.images[0]?.url || 'https://via.placeholder.com/600x600'}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              
              {/* Thumbnail Images */}
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {product.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div>
            <div className="bg-white rounded-lg shadow-sm p-8">
              {/* Product Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="mb-4">
                <StarRating rating={Math.floor(product.rating.average)} count={product.rating.count} />
              </div>

              {/* Price */}
              <div className="mb-6">
                {selectedType === 'purchase' ? (
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ₹{product.price.purchase.toLocaleString()}
                    </span>
                    <span className="text-gray-500">Purchase</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-3xl font-bold text-gray-900">
                        ₹{product.price.rental[selectedRentalPeriod]?.toLocaleString() || 0}
                      </span>
                      <span className="text-gray-500">Rental</span>
                    </div>
                    <div className="flex space-x-2">
                      {Object.entries(product.price.rental).map(([period, price]) => (
                        <button
                          key={period}
                          onClick={() => setSelectedRentalPeriod(period)}
                          className={`px-3 py-1 text-sm rounded-lg border ${
                            selectedRentalPeriod === period
                              ? 'border-orange-500 bg-orange-50 text-orange-700'
                              : 'border-gray-300 text-gray-600'
                          }`}
                        >
                          {period}: ₹{price}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 mb-6">
                {product.description}
              </p>

              {/* Purchase/Rental Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedType('purchase')}
                    disabled={!product.availability.purchase}
                    className={`py-3 px-4 rounded-lg border-2 transition-all ${
                      selectedType === 'purchase'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-300 text-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Purchase
                  </button>
                  <button
                    onClick={() => setSelectedType('rental')}
                    disabled={!product.availability.rental}
                    className={`py-3 px-4 rounded-lg border-2 transition-all ${
                      selectedType === 'rental'
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-gray-300 text-gray-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Rental
                  </button>
                </div>
              </div>

              {/* Size Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Size
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-4 rounded-lg border-2 transition-all ${
                        selectedSize === size
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-300 text-gray-700'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Color
                </label>
                <div className="flex space-x-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? 'border-orange-500 ring-2 ring-orange-200'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-16 text-center font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                  <span className="text-sm text-gray-500">
                    {product.stock} available
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={!isAuthenticated || addingToCart}
                  className="btn-festive py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    <>
                      <ShoppingBag size={20} className="inline mr-2" />
                      Add to Cart
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleBuyNow}
                  disabled={!isAuthenticated || buyingNow}
                  className="bg-green-600 text-white py-3 font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {buyingNow ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      Buy Now - ₹{calculatePrice().toLocaleString()}
                    </>
                  )}
                </button>
              </div>

              <div className="flex space-x-4 mb-6">
                <button
                  onClick={handleAddToWishlist}
                  disabled={!isAuthenticated || addingToWishlist}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isInWishlist(product._id)
                      ? 'border-red-500 bg-red-50 text-red-500'
                      : 'border-gray-300 text-gray-600 hover:border-red-300'
                  } disabled:opacity-50`}
                >
                  {addingToWishlist ? (
                    <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Heart size={20} />
                  )}
                </button>

                <button
                  onClick={handleStartChat}
                  disabled={!isAuthenticated || startingChat}
                  className="p-3 rounded-lg border-2 border-gray-300 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-all disabled:opacity-50"
                  title="Chat with seller"
                >
                  {startingChat ? (
                    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <MessageSquare size={20} />
                  )}
                </button>
              </div>

              {/* Product Features */}
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-gray-600">Free Shipping</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-gray-600">Secure Payment</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-5 h-5 text-orange-500" />
                    <span className="text-sm text-gray-600">Easy Returns</span>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Sold by</p>
                      <p className="text-sm text-gray-600">{product.seller.name}</p>
                    </div>
                  </div>
                  <Link
                    to={`/seller/${product.seller._id}`}
                    className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                  >
                    View Store
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12 bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              <button className="py-4 px-1 border-b-2 border-orange-500 text-orange-600 font-medium">
                Description
              </button>
              <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                Reviews ({product.reviews.length})
              </button>
              <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                Shipping & Returns
              </button>
            </nav>
          </div>
          
          <div className="p-8">
            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h3>
              <p className="text-gray-600">
                {product.description}
              </p>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Product Details</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Category: {product.category}</li>
                <li>• Sub-category: {product.subCategory}</li>
                <li>• Available sizes: {product.sizes.join(', ')}</li>
                <li>• Available colors: {product.colors.join(', ')}</li>
                <li>• Stock: {product.stock} units</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
