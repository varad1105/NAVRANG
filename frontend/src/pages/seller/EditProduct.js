import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save, X, Upload } from 'lucide-react';

const EditProduct = () => {
  const { id } = useParams();
  const { api, isSeller } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'women',
    subCategory: 'traditional-wear',
    price: {
      purchase: '',
      rental: {
        '3-days': '',
        '7-days': '',
        '15-days': ''
      }
    },
    sizes: [],
    colors: [],
    stock: '',
    availability: {
      purchase: true,
      rental: true
    },
    tags: []
  });
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (!isSeller()) {
      return;
    }
    
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setFetchLoading(true);
      const response = await api.get(`/products/${id}`);
      const product = response.data.data.product;
      
      // Check if this product belongs to the current seller
      if (product.seller._id !== api.defaults.headers.common['Authorization']?.user?.id) {
        setError('You can only edit your own products');
        return;
      }
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || 'women',
        subCategory: product.subCategory || 'traditional-wear',
        price: {
          purchase: product.price?.purchase || '',
          rental: {
            '3-days': product.price?.rental?.['3-days'] || '',
            '7-days': product.price?.rental?.['7-days'] || '',
            '15-days': product.price?.rental?.['15-days'] || ''
          }
        },
        sizes: product.sizes || [],
        colors: product.colors || [],
        stock: product.stock || '',
        availability: {
          purchase: product.availability?.purchase !== false,
          rental: product.availability?.rental !== false
        },
        tags: product.tags || []
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch product');
    } finally {
      setFetchLoading(false);
    }
  };

  if (!isSeller()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">Only sellers can access this page</p>
          <Link to="/" className="btn-festive">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="festive-spinner"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const keys = name.split('.');
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...prev[keys[0]],
          [keys[1]]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (name.includes('rental.')) {
      const period = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        price: {
          ...prev.price,
          rental: {
            ...prev.price.rental,
            [period]: value
          }
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const addSize = () => {
    if (newSize && !formData.sizes.includes(newSize)) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, newSize]
      }));
      setNewSize('');
    }
  };

  const removeSize = (size) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size)
    }));
  };

  const addColor = () => {
    if (newColor && !formData.colors.includes(newColor)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }));
      setNewColor('');
    }
  };

  const removeColor = (color) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }));
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.description || !formData.price.purchase || !formData.stock) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (formData.sizes.length === 0) {
        setError('Please add at least one size');
        setLoading(false);
        return;
      }

      const response = await api.put(`/products/${id}`, formData);
      navigate('/seller/products');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/seller/products"
            className="inline-flex items-center text-orange-500 hover:text-orange-600 mb-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Products
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Product</h1>
          <p className="text-gray-600">Update product information</p>
        </div>

        {error && (
          <div className="alert-error mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input w-full"
                    placeholder="Enter product name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="form-input w-full"
                    placeholder="Enter stock quantity"
                    min="0"
                    required
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="form-input w-full"
                  placeholder="Describe your product"
                  required
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="form-input w-full"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kids">Kids</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sub Category
                  </label>
                  <select
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    className="form-input w-full"
                  >
                    <option value="traditional-wear">Traditional Wear</option>
                    <option value="fusion-wear">Fusion Wear</option>
                    <option value="accessories">Accessories</option>
                    <option value="jewelry">Jewelry</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purchase Price *
                  </label>
                  <input
                    type="number"
                    name="price.purchase"
                    value={formData.price.purchase}
                    onChange={handleChange}
                    className="form-input w-full"
                    placeholder="Enter purchase price"
                    min="0"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rental Prices (Optional)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">3 Days</label>
                      <input
                        type="number"
                        name="rental.3-days"
                        value={formData.price.rental['3-days']}
                        onChange={handleChange}
                        className="form-input w-full"
                        placeholder="Price"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">7 Days</label>
                      <input
                        type="number"
                        name="rental.7-days"
                        value={formData.price.rental['7-days']}
                        onChange={handleChange}
                        className="form-input w-full"
                        placeholder="Price"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">15 Days</label>
                      <input
                        type="number"
                        name="rental.15-days"
                        value={formData.price.rental['15-days']}
                        onChange={handleChange}
                        className="form-input w-full"
                        placeholder="Price"
                        min="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Sizes</h2>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className="form-input flex-1"
                  placeholder="Add size (e.g., S, M, L, XL)"
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.sizes.map((size) => (
                  <span key={size} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800">
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="ml-2 text-orange-600 hover:text-orange-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Colors</h2>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="form-input flex-1"
                  placeholder="Add color (e.g., Red, Blue, Green)"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.colors.map((color) => (
                  <span key={color} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    {color}
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="form-input flex-1"
                  placeholder="Add tag (e.g., festive, traditional, navratri)"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Availability</h2>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="availability.purchase"
                    checked={formData.availability.purchase}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Available for Purchase</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="availability.rental"
                    checked={formData.availability.rental}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Available for Rental</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-4">
            <Link
              to="/seller/products"
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn-festive px-6 py-2 flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Update Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
