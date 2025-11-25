import React from 'react';
import { Heart, Users, Award } from 'lucide-react';
import navLogo from '../assets/images/navlogo.png';
import varadImage from '../assets/images/varad.jpg';
import shubdhaImage from '../assets/images/shubdha.jpeg';
import satyamImage from '../assets/images/satyam.jpeg';

const About = () => {
  // Placeholder function for missing images
  const handleImageError = (e) => {
    e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ccircle cx="50" cy="35" r="20" fill="%23d1d5db"/%3E%3Cpath d="M30 70 Q30 60 50 60 Q70 60 70 70 L70 90 L30 90 Z" fill="%23d1d5db"/%3E%3C/svg%3E';
  };

  // Team data
  const teamMembers = [
    {
      name: 'Varad Kengale',
      role: 'Team Leader',
      description: 'Passionate about bringing traditional fashion to modern celebrations',
      image: varadImage
    },
    {
      name: 'Shubdha Anap',
      role: 'Management',
      description: 'Creating innovative designs that blend tradition with contemporary style',
      image: shubdhaImage
    },
    {
      name: 'Satyam Gaikwad',
      role: 'Customer Experience Lead',
      description: 'Ensuring every customer has a memorable shopping experience',
      image: satyamImage
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 flex items-center justify-center">
              <img
                src={navLogo}
                alt="Navrang Logo"
                className="w-full h-full object-contain hover:scale-110 transition-transform duration-300"
              />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About <span className="festive-gradient-text">Navrang</span>
          </h1>
        </div>

        {/* Our Story */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">About us</h2>
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
             We are a team of three TY B.Tech students passionate about technology, creativity, and solving real-world problems through innovative web solutions. This website is a part of our academic project, where we aim to combine our learning with practical implementation.
            </p>
            <p className="mb-4">
           Our goal is to create a platform that is simple, user-friendly, and meaningful for users. Throughout this journey, we have applied our knowledge of web development, UI/UX design, and modern technologies to build a functional and efficient system.
            </p>
            <p>
             This project reflects our teamwork, dedication, and continuous effort to learn and grow as aspiring engineers.
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
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

        {/* Team Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-500 shadow-lg mb-4 flex items-center justify-center bg-gray-100">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={handleImageError}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-sm font-medium text-orange-600 mb-3">{member.role}</p>
                <p className="text-sm text-gray-600">
                  {member.description}
                </p>
              </div>
            ))}
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
