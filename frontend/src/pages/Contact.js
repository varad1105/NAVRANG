import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    // Simulate form submission
    setTimeout(() => {
      setSubmitMessage('Thank you for your message! We will get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're here to help! Get in touch with our team for any questions, 
            concerns, or assistance with your Navratri shopping needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone size={20} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Phone</h3>
                    <p className="text-gray-600">+91 98765 43210</p>
                    <p className="text-sm text-gray-500">Mon-Sat: 9AM-6PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Email</h3>
                    <p className="text-gray-600">support@navrang.com</p>
                    <p className="text-sm text-gray-500">We respond within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Office</h3>
                    <p className="text-gray-600">
                      123, Fashion street<br />
                      Pune, Maharashtra<br />
                      India - 380001
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-4">Quick Help</h3>
                <div className="space-y-2">
                  <a href="/faq" className="block text-orange-500 hover:text-orange-600">
                    Frequently Asked Questions
                  </a>
                  <a href="/shipping" className="block text-orange-500 hover:text-orange-600">
                    Shipping & Delivery
                  </a>
                  <a href="/returns" className="block text-orange-500 hover:text-orange-600">
                    Returns & Exchanges
                  </a>
                  <a href="/size-guide" className="block text-orange-500 hover:text-orange-600">
                    Size Guide
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
              
              {submitMessage && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg">
                  {submitMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="form-input w-full"
                      placeholder="Enter your name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="form-input w-full"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="form-input w-full"
                  >
                    <option value="">Select a subject</option>
                    <option value="order">Order Inquiry</option>
                    <option value="product">Product Question</option>
                    <option value="shipping">Shipping & Delivery</option>
                    <option value="return">Return & Exchange</option>
                    <option value="technical">Technical Support</option>
                    <option value="partnership">Partnership Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="form-input w-full"
                    placeholder="Tell us how we can help you..."
                  />
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    <MessageSquare size={16} className="inline mr-1" />
                    We typically respond within 24 hours
                  </p>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-festive px-6 py-3 flex items-center disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={18} className="mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* FAQ Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    How long does shipping take?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Standard shipping takes 5-7 business days. Express shipping is available for 2-3 business days.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    What is your return policy?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    We offer 15-day return policy for unused items in original packaging.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Do you offer rental services?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Yes! We offer rental options for 3, 7, and 15 days with secure deposit.
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <a href="/faq" className="text-orange-500 hover:text-orange-600 font-medium">
                  View all FAQs →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
