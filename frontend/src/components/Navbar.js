import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Search, ShoppingCart, User, Menu, X, Heart, Store, LogOut, Package, MessageSquare } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout, isSeller } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate cart item count directly from cart state
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsProfileOpen(false);
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="nav-festive sticky top-0 z-50 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            <span className="text-2xl font-bold festive-gradient-text">Navrang</span>
          </Link>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for Navratri outfits..."
                className="form-input w-full pr-10"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-600"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/products"
              className={`text-gray-700 hover:text-orange-500 transition-colors ${
                isActiveLink('/products') ? 'text-orange-500 font-semibold' : ''
              }`}
            >
              Shop
            </Link>
            
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className={`text-gray-700 hover:text-orange-500 transition-colors relative ${
                  isActiveLink('/wishlist') ? 'text-orange-500 font-semibold' : ''
                }`}
              >
                <Heart size={20} />
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/chat"
                className={`text-gray-700 hover:text-orange-500 transition-colors relative ${
                  isActiveLink('/chat') ? 'text-orange-500 font-semibold' : ''
                }`}
              >
                <MessageSquare size={20} />
              </Link>
            )}

            <Link
              to="/cart"
              className={`text-gray-700 hover:text-orange-500 transition-colors relative ${
                isActiveLink('/cart') ? 'text-orange-500 font-semibold' : ''
              }`}
            >
              <ShoppingCart size={20} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors"
                >
                  <User size={20} />
                  <span className="text-sm">{user.name}</span>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={16} className="inline mr-2" />
                      Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Package size={16} className="inline mr-2" />
                      My Orders
                    </Link>
                    {isSeller() && (
                      <Link
                        to="/seller/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-500"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <Store size={16} className="inline mr-2" />
                        Seller Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-500"
                    >
                      <LogOut size={16} className="inline mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-orange-500 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-festive text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 hover:text-orange-500"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="form-input w-full pr-10"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-orange-500"
                >
                  <Search size={20} />
                </button>
              </div>
            </form>

            <div className="space-y-3">
              <Link
                to="/products"
                className="block text-gray-700 hover:text-orange-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Shop
              </Link>
              
              {isAuthenticated && (
                <>
                  <Link
                    to="/wishlist"
                    className="block text-gray-700 hover:text-orange-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                  <Link
                    to="/chat"
                    className="block text-gray-700 hover:text-orange-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Messages
                  </Link>
                  <Link
                    to="/cart"
                    className="block text-gray-700 hover:text-orange-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cart ({cartItemCount})
                  </Link>
                  <Link
                    to="/profile"
                    className="block text-gray-700 hover:text-orange-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block text-gray-700 hover:text-orange-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  {isSeller() && (
                    <Link
                      to="/seller/dashboard"
                      className="block text-gray-700 hover:text-orange-500 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Seller Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block text-left text-gray-700 hover:text-red-500 transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="block text-gray-700 hover:text-orange-500 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block btn-festive text-sm text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
