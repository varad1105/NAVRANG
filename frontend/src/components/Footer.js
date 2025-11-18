import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, Clock } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Festive top border */}
      <div className="h-2 festive-gradient"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-2xl font-bold">Navrang</span>
            </div>
            <p className="text-gray-300 text-sm">
              Your complete destination for Navratri outfits and festive fashion. 
              Celebrate in style with our authentic collection.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
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
                <Link to="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Size Guide
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Shipping & Delivery
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Rental Policy
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
                  Payment Options
                </Link>
              </li>
              <li>
                <Link to="#" className="text-gray-300 hover:text-orange-400 transition-colors text-sm">
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
                <span className="text-gray-300 text-sm">support@navrang.com</span>
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
            <form className="flex flex-col sm:flex-row max-w-md mx-auto gap-3">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-orange-400"
                required
              />
              <button
                type="submit"
                className="btn-festive px-6 py-2 rounded-lg"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Navrang Navratri. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <Link to="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                Terms of Service
              </Link>
              <Link to="#" className="text-gray-400 hover:text-orange-400 transition-colors">
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
