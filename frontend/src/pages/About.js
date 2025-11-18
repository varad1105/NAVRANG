import React from 'react';
import { Sparkles, Heart, Users, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About <span className="festive-gradient-text">Navrang Navratri</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Celebrating the vibrant spirit of Navratri with authentic traditional and festive fashion
          </p>
        </div>

        {/* Our Story */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              Founded in 2020, Navrang Navratri began with a simple mission: to bring the joy and 
              authenticity of traditional Navratri attire to every celebration. What started as a 
              small collection of handpicked outfits has grown into a comprehensive platform for 
              festive fashion.
            </p>
            <p className="mb-4">
              We understand that Navratri is more than just a festival - it's a celebration of 
              culture, tradition, and community. That's why every piece in our collection is 
              carefully selected to honor the rich heritage while embracing contemporary styles.
            </p>
            <p>
              Today, Navrang Navratri serves thousands of customers across the country, helping 
              them celebrate Garba, Dandiya, and other Navratri festivities with style and grace.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Authenticity</h3>
            <p className="text-sm text-gray-600">
              Genuine traditional designs that celebrate our cultural heritage
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Quality</h3>
            <p className="text-sm text-gray-600">
              Premium fabrics and craftsmanship that ensure comfort and durability
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Community</h3>
            <p className="text-sm text-gray-600">
              Supporting local artisans and promoting traditional craftsmanship
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Excellence</h3>
            <p className="text-sm text-gray-600">
              Committed to providing the best shopping experience and service
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-8 text-white text-center mb-12">
          <h2 className="text-2xl font-bold mb-8">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold mb-2">50K+</div>
              <div className="text-orange-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">1000+</div>
              <div className="text-orange-100">Unique Designs</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">500+</div>
              <div className="text-orange-100">Artisans Supported</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">4.8★</div>
              <div className="text-orange-100">Customer Rating</div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="font-semibold text-gray-900 mb-1">Priya Patel</h3>
              <p className="text-sm text-gray-600 mb-2">Founder & CEO</p>
              <p className="text-sm text-gray-500">
                Passionate about bringing traditional fashion to modern celebrations
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="font-semibold text-gray-900 mb-1">Rahul Sharma</h3>
              <p className="text-sm text-gray-600 mb-2">Head of Design</p>
              <p className="text-sm text-gray-500">
                Creating innovative designs that blend tradition with contemporary style
              </p>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="font-semibold text-gray-900 mb-1">Anjali Desai</h3>
              <p className="text-sm text-gray-600 mb-2">Customer Experience Lead</p>
              <p className="text-sm text-gray-500">
                Ensuring every customer has a memorable shopping experience
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Join Our Celebration
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Be part of our growing community and celebrate Navratri in style with our 
            authentic collection of traditional and festive wear.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/products" className="btn-festive px-8 py-3 inline-block">
              Explore Collection
            </a>
            <a href="/contact" className="px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 inline-block">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
