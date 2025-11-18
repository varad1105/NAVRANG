import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Star, ShoppingBag, Users, TrendingUp, ArrowRight, Sparkles, Heart } from 'lucide-react';
import { getPlaceholderImage } from '../utils/imageUtils';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading featured products
    const mockFeaturedProducts = [
      {
        _id: '1',
        name: 'Traditional Navratri Chaniya Choli',
        description: 'Beautiful hand-embroidered chaniya choli with mirror work',
        price: { purchase: 2999 },
        images: [{ url: getPlaceholderImage(300, 400, 'Chaniya+Choli') }],
        rating: { average: 4.5, count: 23 },
        category: 'women'
      },
      {
        _id: '2',
        name: 'Designer Kediyu for Men',
        description: 'Traditional Gujarati kediyu with modern design',
        price: { purchase: 1899 },
        images: [{ url: getPlaceholderImage(300, 400, 'Kediyu') }],
        rating: { average: 4.3, count: 18 },
        category: 'men'
      },
      {
        _id: '3',
        name: 'Kids Navratri Special Dress',
        description: 'Colorful and comfortable dress for young dancers',
        price: { purchase: 1299 },
        images: [{ url: getPlaceholderImage(300, 400, 'Kids+Dress') }],
        rating: { average: 4.7, count: 31 },
        category: 'kids'
      },
      {
        _id: '4',
        name: 'Fusion Garba Outfit',
        description: 'Modern twist to traditional garba attire',
        price: { purchase: 2499 },
        images: [{ url: getPlaceholderImage(300, 400, 'Fusion+Wear') }],
        rating: { average: 4.6, count: 27 },
        category: 'women'
      }
    ];

    setTimeout(() => {
      setFeaturedProducts(mockFeaturedProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const categories = [
    {
      name: 'Women',
      image: 'https://picsum.photos/seed/navrangwomen/400/300.jpg',
      link: '/products?category=women',
      description: 'Traditional & Fusion Wear'
    },
    {
      name: 'Men',
      image: 'https://picsum.photos/seed/navrangmen/400/300.jpg',
      link: '/products?category=men',
      description: 'Kediyu & Traditional Attire'
    },
    {
      name: 'Kids',
      image: 'https://picsum.photos/seed/navrangkids/400/300.jpg',
      link: '/products?category=kids',
      description: 'Colorful Kids Collection'
    },
    {
      name: 'Accessories',
      image: 'https://picsum.photos/seed/navrangaccessories/400/300.jpg',
      link: '/products?category=accessories',
      description: 'Jewelry & More'
    }
  ];

  const features = [
    {
      icon: <ShoppingBag className="w-8 h-8" />,
      title: 'Shop or Rent',
      description: 'Choose from our wide range of outfits available for purchase or rental'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'For Everyone',
      description: 'Complete collection for men, women, and kids to celebrate Navratri'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Latest Trends',
      description: 'Stay fashionable with our curated collection of traditional and fusion wear'
    }
  ];

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
        <span className="text-sm text-gray-600">({count})</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="font-semibold">🎭 Demo Mode Active!</span>
            <span className="ml-2">Try our complete purchase flow with demo payment - no real money charged!</span>
            <Link to="/products" className="ml-4 underline hover:no-underline">
              Start Shopping →
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="festive-pattern absolute inset-0 opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Sparkles className="w-12 h-12 text-orange-500 animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              <span className="festive-gradient-text">Navrang Navratri</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Celebrate the festival of colors with our exquisite collection of traditional and fusion Navratri outfits
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="btn-festive text-lg px-8 py-4 inline-flex items-center justify-center space-x-2"
              >
                <ShoppingBag size={20} />
                <span>Shop Now</span>
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/register"
                  className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold py-4 px-8 rounded-lg transition-all duration-300 text-lg"
                >
                  Join Us
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Navrang?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We bring you the best of Navratri fashion with quality, variety, and convenience
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                <div className="flex justify-center text-orange-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-lg text-gray-600">
              Find the perfect outfit for every family member
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={category.link}
                className="group block overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="relative">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{category.name}</h3>
                    <p className="text-sm">{category.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Collections
            </h2>
            <p className="text-lg text-gray-600">
              Handpicked favorites for this Navratri season
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="festive-spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <div key={product._id} className="festive-card bg-white rounded-lg shadow-md overflow-hidden">
                  <Link to={`/products/${product._id}`}>
                    <div className="product-gallery">
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  </Link>
                  
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
                    
                    <div className="flex space-x-2">
                      <Link
                        to={`/products/${product._id}`}
                        className="flex-1 bg-orange-500 text-white text-center py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                      >
                        View Details
                      </Link>
                      <button className="p-2 text-gray-600 hover:text-red-500 transition-colors">
                        <Heart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center space-x-2 text-orange-500 hover:text-orange-600 font-semibold text-lg"
            >
              <span>View All Products</span>
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 festive-pattern">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Celebrate Navratri in Style?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of happy customers who found their perfect Navratri outfit with us
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="btn-festive text-lg px-8 py-4 inline-flex items-center justify-center space-x-2"
            >
              <ShoppingBag size={20} />
              <span>Start Shopping</span>
            </Link>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="bg-white text-orange-500 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-all duration-300 text-lg"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
