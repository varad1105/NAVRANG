import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Search, Filter, Heart, Star, Grid, List, ShoppingBag, X, ChevronDown } from 'lucide-react';
import { getFirstValidSize, getImageWithFallback } from '../utils/validation';

const Products = () => {
  const { api, isAuthenticated } = useAuth();
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    subCategory: '',
    minPrice: '',
    maxPrice: '',
    size: '',
    sortBy: 'newest'
  });

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0
  });

  // Get initial filters from URL
  useEffect(() => {
    const initialFilters = {
      category: searchParams.get('category') || '',
      search: searchParams.get('search') || '',
      subCategory: searchParams.get('subCategory') || '',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      size: searchParams.get('size') || '',
      sortBy: searchParams.get('sortBy') || 'newest'
    };
    setFilters(prev => ({ ...prev, ...initialFilters }));
  }, [searchParams]);

  // Fetch products
  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams({
        page,
        limit: 12,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== '')
        )
      });

      const response = await api.get(`/products?${params}`);
      setProducts(response.data.data.products);
      setPagination(response.data.data.pagination);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      subCategory: '',
      minPrice: '',
      maxPrice: '',
      size: '',
      sortBy: 'newest'
    });
  };

  const handleAddToCart = async (productId, size) => {
    console.log('🛒 Add to cart clicked:', { productId, size, isAuthenticated });
    
    if (!isAuthenticated) {
      setError('Please login to add items to cart');
      console.log('❌ User not authenticated');
      return;
    }
    
    // Validate and get a proper size
    const validSize = getFirstValidSize([size]);
    console.log('📏 Using validated size:', validSize, 'from original size:', size);
    
    try {
      console.log('🔄 Calling addToCart...');
      const result = await addToCart(productId, 1, validSize);
      console.log('📦 Add to cart result:', result);
      
      if (!result.success) {
        setError(result.error);
        console.log('❌ Add to cart failed:', result.error);
      } else {
        // Clear any previous errors and show success feedback
        setError('');
        console.log('✅ Item added to cart successfully');
        // Show success message temporarily
        setError('✅ Item added to cart!');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('💥 Add to cart error:', error);
      setError('Failed to add item to cart');
    }
  };

  const handleBuyNow = async (productId, size) => {
    if (!isAuthenticated) {
      setError('Please login to purchase items');
      return;
    }
    
    // Add to cart first, then redirect to checkout
    const result = await addToCart(productId, 1, size);
    if (result.success) {
      navigate('/checkout');
    } else {
      setError(result.error);
    }
  };

  const handleAddToWishlist = async (productId) => {
    const result = await addToWishlist(productId);
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

  const ProductCard = ({ product }) => {
    const [addingToCart, setAddingToCart] = useState(false);
    
    const handleAddToCartClick = async () => {
      setAddingToCart(true);
      await handleAddToCart(product._id, getFirstValidSize(product.sizes));
      setAddingToCart(false);
    };
    
    return (
      <div className="festive-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <Link to={`/products/${product._id}`}>
          <div className="product-gallery relative overflow-hidden">
            <img
              src={getImageWithFallback(product.images[0]?.url, 300, 400)}
              alt={product.name}
              className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300"></div>
          </div>
        </Link>
        
        <div className="p-4">
          <Link to={`/products/${product._id}`}>
            <h3 className="font-semibold text-gray-900 mb-2 hover:text-orange-500 transition-colors line-clamp-2">
              {product.name}
            </h3>
          </Link>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between mb-3">
            <div className="price-badge bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              ₹{product.price.purchase.toLocaleString()}
            </div>
            <StarRating rating={Math.floor(product.rating.average)} count={product.rating.count} />
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-wrap gap-1">
              {product.sizes.slice(0, 3).map((size) => (
                <span key={size} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {size}
                </span>
              ))}
              {product.sizes.length > 3 && (
                <span className="text-xs text-gray-500">+{product.sizes.length - 3}</span>
              )}
            </div>
            <div className="flex space-x-1">
              {product.colors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: color.toLowerCase() }}
                  title={color}
                ></div>
              ))}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleAddToCartClick}
              disabled={addingToCart}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center py-2 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {addingToCart ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <ShoppingBag size={16} className="mr-1" />
                  Add to Cart
                </>
              )}
            </button>
            
            <button
              onClick={() => handleAddToWishlist(product._id)}
              className="p-2 border border-gray-300 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
            >
              <Heart 
                size={16} 
                className={isInWishlist(product._id) ? 'fill-red-500 text-red-500' : 'text-gray-600'} 
              />
            </button>
          </div>
          
          {/* Buy Now Button */}
          <button
            onClick={() => handleBuyNow(product._id, getFirstValidSize(product.sizes))}
            className="w-full mt-2 bg-green-600 text-white text-center py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            🚀 Buy Now (Demo)
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Navratri Collection
          </h1>
          <p className="text-gray-600">
            Discover our authentic range of traditional and festive outfits
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="form-input w-full pl-10"
                />
              </div>
            </div>

            {/* Filter Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter size={18} />
                <span>Filters</span>
                {(filters.category || filters.subCategory || filters.minPrice || filters.maxPrice || filters.size) && (
                  <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                    {Object.values(filters).filter(Boolean).length}
                  </span>
                )}
              </button>

              {/* View Mode */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'text-gray-600'}`}
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'text-gray-600'}`}
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="form-input w-full"
                  >
                    <option value="">All Categories</option>
                    <option value="men">Men</option>
                    <option value="women">Women</option>
                    <option value="kids">Kids</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                {/* Sub Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Category
                  </label>
                  <select
                    value={filters.subCategory}
                    onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                    className="form-input w-full"
                  >
                    <option value="">All Types</option>
                    <option value="traditional-wear">Traditional Wear</option>
                    <option value="fusion-wear">Fusion Wear</option>
                    <option value="accessories">Accessories</option>
                    <option value="jewelry">Jewelry</option>
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="form-input w-1/2"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="form-input w-1/2"
                    />
                  </div>
                </div>

                {/* Size Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Size
                  </label>
                  <select
                    value={filters.size}
                    onChange={(e) => handleFilterChange('size', e.target.value)}
                    className="form-input w-full"
                  >
                    <option value="">All Sizes</option>
                    <option value="XS">XS</option>
                    <option value="S">S</option>
                    <option value="M">M</option>
                    <option value="L">L</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="3XL">3XL</option>
                    <option value="4XL">4XL</option>
                    <option value="5XL">5XL</option>
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="form-input w-full"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
                  >
                    <X size={18} className="inline mr-2" />
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error/Success Message */}
        {error && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            error.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex-1">
              {error}
            </div>
            <button
              onClick={() => setError('')}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="festive-spinner"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 mb-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => fetchProducts(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <span className="text-gray-600">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                
                <button
                  onClick={() => fetchProducts(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
