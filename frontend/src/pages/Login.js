import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ShoppingBag } from 'lucide-react';
import navLogo from '../assets/images/navlogo.png';

const Login = () => {
  const { login, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      setFormError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setFormError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    const result = await login(formData.email, formData.password);
    
    if (!result.success) {
      setFormError(result.error);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
              <img
                src={navLogo}
                alt="Navrang Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back to <span className="festive-gradient-text">Navrang</span>
          </h2>
          <p className="text-gray-600">
            Sign in to continue your festive shopping journey
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Messages */}
            {(error || formError) && (
              <div className="alert-error">
                {formError || error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="form-input w-full"
                placeholder="your@email.com"
                disabled={loading || isSubmitting}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input w-full pr-10"
                  placeholder="Enter your password"
                  disabled={loading || isSubmitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || isSubmitting}
              className="btn-festive w-full py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="festive-spinner w-5 h-5 mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">New to Navrang?</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <Link
              to="/register"
              className="inline-flex items-center text-orange-500 hover:text-orange-600 font-medium"
            >
              <ShoppingBag size={18} className="mr-2" />
              Create an account
            </Link>
          </div>
        </div>

        {/* Footer Links */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-orange-500 hover:text-orange-600">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-orange-500 hover:text-orange-600">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
