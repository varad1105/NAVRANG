// Valid sizes that match backend validation
export const VALID_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'];

// Valid types that match backend validation
export const VALID_TYPES = ['purchase', 'rental'];

// Valid rental periods that match backend validation
export const VALID_RENTAL_PERIODS = ['3-days', '7-days', '15-days'];

// Helper function to get first valid size from product sizes
export const getFirstValidSize = (sizes) => {
  if (!sizes || !Array.isArray(sizes) || sizes.length === 0) {
    return 'M'; // Default fallback size
  }
  
  // Find the first valid size from the product's available sizes
  const validSize = sizes.find(size => VALID_SIZES.includes(size));
  return validSize || 'M'; // Fallback to 'M' if no valid size found
};

// Helper function to validate cart data before sending to backend
export const validateCartData = (productId, quantity, size, type = 'purchase', rentalPeriod = null) => {
  const errors = [];
  
  if (!productId || typeof productId !== 'string') {
    errors.push('Invalid product ID');
  }
  
  if (!quantity || quantity < 1) {
    errors.push('Quantity must be at least 1');
  }
  
  if (!size || !VALID_SIZES.includes(size)) {
    errors.push(`Invalid size: ${size}. Valid sizes are: ${VALID_SIZES.join(', ')}`);
  }
  
  if (!VALID_TYPES.includes(type)) {
    errors.push(`Invalid type: ${type}. Valid types are: ${VALID_TYPES.join(', ')}`);
  }
  
  if (type === 'rental') {
    if (!rentalPeriod || !VALID_RENTAL_PERIODS.includes(rentalPeriod)) {
      errors.push(`Invalid rental period: ${rentalPeriod}. Valid periods are: ${VALID_RENTAL_PERIODS.join(', ')}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get a reliable placeholder image URL
export const getPlaceholderImage = (width = 300, height = 400, text = 'No Image') => {
  // Use picsum photos as reliable placeholder service
  return `https://picsum.photos/seed/navrang${width}${height}/${width}/${height}.jpg`;
};

// Get image URL with fallback
export const getImageWithFallback = (imageUrl, width = 300, height = 400, text = 'No Image') => {
  if (!imageUrl) {
    return getPlaceholderImage(width, height, text);
  }
  
  // If the URL contains via.placeholder.com, replace it
  if (imageUrl.includes('via.placeholder.com')) {
    return getPlaceholderImage(width, height, text);
  }
  
  return imageUrl;
};
