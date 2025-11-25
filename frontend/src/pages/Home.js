import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, Users, TrendingUp, Award, Heart } from 'lucide-react';
import womenCategoryImage from '../assets/images/1.jpg';
import menCategoryImage from '../assets/images/3.jpg';
import kidsCategoryImage from '../assets/images/2.jpg';
import AccessoriesCategoryImage from '../assets/images/unnamed.jpg';
import navLogo from '../assets/images/navlogo.png';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const categories = [
    {
      name: 'Women',
      image: womenCategoryImage,
      link: '/products?category=women',
      description: 'Traditional & Fusion Wear'
    },
    {
      name: 'Men',
      image: menCategoryImage,
      link: '/products?category=men',
      description: 'Kediyu & Traditional Attire'
    },
    {
      name: 'Kids',
      image: kidsCategoryImage,
      link: '/products?category=kids',
      description: 'Colorful Kids Collection'
    },
    {
      name: 'Accessories',
      image: AccessoriesCategoryImage,
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

  const aboutHighlights = [
    {
      icon: <ShoppingBag className="w-6 h-6" />,
      title: 'Authenticity',
      description: 'Genuine traditional designs that celebrate our cultural heritage'
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Quality',
      description: 'Premium fabrics and craftsmanship that ensure comfort and durability'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Community',
      description: 'Supporting local artisans and promoting traditional craftsmanship'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Excellence',
      description: 'Committed to providing the best shopping experience and service'
    }
  ];

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
            {/* Logo Section */}
            <div className="flex justify-center mb-6">
              <img
                src={navLogo}
                alt="Navrang Logo"
                className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-lg hover:scale-110 transition-transform duration-300"
              />
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              <span className="festive-gradient-text">Navrang</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
              Celebrate the festival of colors with our exquisite collection of traditional and fusion festive outfits
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

      {/* About Us Preview Section */}
      <section className="py-16" style={{ backgroundColor: '#E6EFF4' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About <span className="festive-gradient-text">Navrang</span>
              </h2>
              
              <p className="text-gray-700 text-lg mb-4">
                We are a team of three TY B.Tech students passionate about technology, creativity, and solving real-world problems through innovative web solutions.
              </p>
              
              <p className="text-gray-700 text-lg mb-8">
                Our goal is to create a platform that is simple, user-friendly, and meaningful for users. This project reflects our teamwork, dedication, and continuous effort to learn and grow as aspiring engineers.
              </p>

              <Link
                to="/about"
                className="inline-flex items-center space-x-2 btn-festive px-8 py-3 text-lg"
              >
                <span>Learn More About Us</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Right - Values Grid */}
            <div className="grid grid-cols-2 gap-6">
              {aboutHighlights.map((highlight, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow text-center"
                >
                  <div className="flex justify-center text-orange-500 mb-3">
                    {highlight.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {highlight.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {highlight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-8 text-white text-center">
            <div>
              <div className="text-3xl font-bold mb-2">50K+</div>
              <div className="text-orange-100 text-sm">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">1000+</div>
              <div className="text-orange-100 text-sm">Unique Designs</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-orange-100 text-sm">Artisans Supported</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">4.8★</div>
              <div className="text-orange-100 text-sm">Customer Rating</div>
            </div>
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
