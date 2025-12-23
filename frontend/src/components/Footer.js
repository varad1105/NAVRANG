import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Clock } from 'lucide-react';
import navLogo from '../assets/images/navlogo.png';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { api } = useAuth();
  const [email, setEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState({ type: '', text: '' });

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setNewsletterMessage({ type: 'error', text: 'Please enter your email address' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setNewsletterMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    try {
      setNewsletterLoading(true);
      setNewsletterMessage({ type: '', text: '' });

      console.log('📧 Subscribing email:', email);
      
      // Make sure API endpoint is correct
      const response = await api.post('/newsletter/subscribe', { email });

      console.log('✅ Newsletter response:', response.data);

      if (response.data.success) {
        setNewsletterMessage({
          type: 'success',
          text: response.data.message || 'Successfully subscribed to newsletter!'
        });
        setEmail('');
        setTimeout(() => setNewsletterMessage({ type: '', text: '' }), 5000);
      }
    } catch (error) {
      console.error('📧 Newsletter error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to subscribe. Please try again.';
      setNewsletterMessage({ type: 'error', text: errorMessage });
    } finally {
      setNewsletterLoading(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Festive top border */}
      <div className="h-2 festive-gradient"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src={navLogo}
                  alt="Navrang Logo"
                  className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-2xl font-bold">Navrang</span>
            </div>
            <p className="text-gray-300 text-sm">
              Your complete destination for Navratri outfits and festive fashion. 
              Celebrate in style with our authentic collection.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-orange-400 transition-colors"
                aria-label="YouTube"
              >
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-400">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link to="/products?category=men" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Men's Collection
                </Link>
              </li>
              <li>
                <Link to="/products?category=women" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Women's Collection
                </Link>
              </li>
              <li>
                <Link to="/products?category=kids" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Kids' Collection
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-400">Customer Services</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/rental-policy" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Rental Policy
                </Link>
              </li>
              <li>
                <Link to="/payment" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Payment Options
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-400">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-orange-400" />
                <span className="text-gray-300 text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-orange-400" />
                <a 
                  href="mailto:support@navrang.com"
                  className="text-gray-300 hover:text-orange-400 transition-colors text-sm"
                >
                  support@navrang.com
                </a>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={18} className="text-orange-400 mt-1" />
                <span className="text-gray-300 text-sm">
                  123, Festival Street,<br />
                  Navrati Nagar, Gujarat<br />
                  India - 380001
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock size={18} className="text-orange-400" />
                <div className="text-gray-300 text-sm">
                  <p>Mon - Sat: 10:00 AM - 8:00 PM</p>
                  <p>Sunday: 11:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 p-6 bg-gray-800 rounded-lg">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-orange-400 mb-2">
              Subscribe to Our Newsletter
            </h3>
            <p className="text-gray-300 text-sm mb-4">
              Get exclusive offers and be the first to know about new collections
            </p>
            
            {/* Newsletter Form */}
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition-all"
                disabled={newsletterLoading}
              />
              <button
                type="submit"
                disabled={newsletterLoading}
                className="btn-festive px-6 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-fit"
              >
                {newsletterLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Subscribing...
                  </>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>

            {/* Newsletter Message */}
            {newsletterMessage.text && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${
                newsletterMessage.type === 'success'
                  ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                  : 'bg-red-500/20 text-red-300 border border-red-500/50'
              }`}>
                {newsletterMessage.text}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 Navrang. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-orange-400 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-orange-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
