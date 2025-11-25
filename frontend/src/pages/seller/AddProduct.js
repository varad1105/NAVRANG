import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Save, X, Camera, CameraOff } from 'lucide-react';

const AddProduct = () => {
  const { api, isSeller } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
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
    sizes: ['S', 'M', 'L'],
    colors: ['Red', 'Blue'],
    images: [{
      url: `https://picsum.photos/seed/navrang-${Math.random().toString(36).substr(2, 9)}/400/500.jpg`,
      alt: 'Product image'
    }],
    stock: '1',
    availability: {
      purchase: true,
      rental: true
    },
    tags: []
  });
  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  
  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // Check browser compatibility
  const isCameraSupported = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);

  // Image management functions
  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, { url: newImageUrl.trim(), alt: 'Product image' }]
      });
      setNewImageUrl('');
    }
  };
  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  // Camera functions
  const startCamera = async () => {
    try {
      setCameraError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setShowCamera(true);
    } catch (error) {
      console.error('Camera access error:', error);
      let errorMessage = 'Unable to access camera.';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera permission was denied. Please allow camera access in your browser settings and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera device found. Please ensure your device has a camera connected.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Camera is not supported by your browser. Please try using a modern browser like Chrome, Firefox, or Safari.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application. Please close other apps using the camera and try again.';
      } else {
        errorMessage = `Camera access failed: ${error.message}`;
      }
      
      setCameraError(errorMessage);
    }
  };

  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
    setCapturedImage(null);
  }, [cameraStream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCapturedImage(imageDataUrl);
    }
  };

  const useCapturedImage = () => {
    if (capturedImage) {
      setFormData({
        ...formData,
        images: [...formData.images, { url: capturedImage, alt: 'Product image - camera capture' }]
      });
      stopCamera();
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  // Cleanup camera stream on component unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

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

      if (formData.colors.length === 0) {
        setError('Please add at least one color');
        setLoading(false);
        return;
      }

      console.log('Submitting form data:', JSON.stringify(formData, null, 2));
      const response = await api.post('/products', formData);
      console.log('Product created successfully:', response.data);
      navigate('/seller/products');
    } catch (error) {
      console.error('Add product error:', error.response?.data);
      if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        // Show specific validation errors
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        setError(errorMessages);
      } else {
        setError(error.response?.data?.message || 'Failed to add product');
      }
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
            <ArrowLeft size={20} width={20} height={20} className="mr-2" />
            Back to Products
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Product</h1>
          <p className="text-gray-600">Create a new product listing</p>
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

            {/* Images */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
              
              {/* Current Images */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Images ({formData.images.length})
                </label>
                
                {/* Debug Info */}
                <div className="mb-3 p-2 bg-gray-50 rounded text-xs">
                  <strong>Debug:</strong> Current image URLs: 
                  <ul className="mt-1">
                    {formData.images.map((img, idx) => (
                      <li key={idx} className="text-blue-600 break-all">{img.url}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.src = 'https://picsum.photos/seed/fallback/400/500.jpg';
                          e.target.alt = 'Image failed to load';
                        }}
                        onLoad={(e) => {
                          console.log('Image loaded successfully:', image.url);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} width={16} height={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Product Images
                </label>
                
                {/* Image Input Options */}
                <div className="space-y-4">
                  {/* URL Input */}
                  <div>
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="form-input flex-1"
                        placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                      />
                      <button
                        type="button"
                        onClick={handleAddImage}
                        className="btn-festive px-4 py-2"
                      >
                        Add URL
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Or use placeholder: https://picsum.photos/seed/yourtext/400/500.jpg
                    </p>
                  </div>

                  {/* Camera Option */}
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Or take a photo with camera</span>
                      {!isCameraSupported ? (
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                          Camera not supported
                        </span>
                      ) : !showCamera ? (
                        <button
                          type="button"
                          onClick={startCamera}
                          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          <Camera size={16} width={16} height={16} className="mr-2" />
                          Open Camera
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <CameraOff size={16} width={16} height={16} className="mr-2" />
                          Close Camera
                        </button>
                      )}
                    </div>
                    
                    {!isCameraSupported && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <div className="text-sm text-yellow-800">
                          <strong>Browser Compatibility:</strong> Camera access requires a modern browser (Chrome 53+, Firefox 36+, Safari 11+). Please update your browser or try a different one.
                        </div>
                      </div>
                    )}

                    {cameraError && (
                      <div className="alert-error mb-3">
                        <div className="font-medium mb-1">Camera Access Issue</div>
                        <div className="text-sm">{cameraError}</div>
                        <div className="mt-2 text-xs">
                          <strong>How to enable camera access:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            <li>Click the camera icon 📷 in your browser's address bar</li>
                            <li>Select "Allow" for camera permissions</li>
                            <li>Refresh the page and try again</li>
                            <li>For mobile: ensure you're using HTTPS or localhost</li>
                          </ul>
                        </div>
                      </div>
                    )}

                    {/* Camera View */}
                    {showCamera && (
                      <div className="space-y-4">
                        {!capturedImage ? (
                          <div>
                            <div className="relative bg-black rounded-lg overflow-hidden" style={{ maxHeight: '400px' }}>
                              <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="w-full h-full object-contain"
                                style={{ maxHeight: '400px' }}
                              />
                            </div>
                            <div className="flex justify-center mt-3">
                              <button
                                type="button"
                                onClick={capturePhoto}
                                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                              >
                                📸 Capture Photo
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="relative rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={capturedImage}
                                alt="Captured"
                                className="w-full h-auto object-contain"
                                style={{ maxHeight: '400px' }}
                              />
                            </div>
                            <div className="flex justify-center space-x-3 mt-3">
                              <button
                                type="button"
                                onClick={retakePhoto}
                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                              >
                                Retake
                              </button>
                              <button
                                type="button"
                                onClick={useCapturedImage}
                                className="px-4 py-2 btn-festive"
                              >
                                Use This Photo
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Hidden canvas for image capture */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />
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
                      <X size={14} width={14} height={14} />
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
                      <X size={14} width={14} height={14} />
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
                      <X size={14} width={14} height={14} />
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
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} width={16} height={16} className="mr-2" />
                  Add Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
