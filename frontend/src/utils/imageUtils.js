// Utility functions for image handling

// Reliable placeholder services as fallbacks
const PLACEHOLDER_SERVICES = [
  'https://picsum.photos/seed/{width}x{height}/{width}/{height}',
  'https://source.unsplash.com/random/{width}x{height}?product',
  'https://dummyimage.com/{width}x{height}/cccccc/000000&text=No+Image',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0ie3dpZHRofSIgaGVpZ2h0PSJ7aGVpZ2h0fSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='
];

// Get a reliable placeholder image URL
export const getPlaceholderImage = (width = 300, height = 400, text = 'No Image') => {
  // Try the first reliable service (picsum)
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

// Handle image load error
export const handleImageError = (event, width = 300, height = 400) => {
  event.target.src = getPlaceholderImage(width, height);
  event.target.onerror = null; // Prevent infinite loop
};

// Create a local SVG placeholder as base64
export const createLocalPlaceholder = (width, height, text = 'No Image') => {
  // Ensure width and height are valid numbers
  const safeWidth = width && width > 0 ? width : 300;
  const safeHeight = height && height > 0 ? height : 400;
  
  const svg = `
    <svg width="${safeWidth}" height="${safeHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(safeWidth, safeHeight) / 10}" 
            fill="#9ca3af" text-anchor="middle" dy=".3em">${text}</text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
