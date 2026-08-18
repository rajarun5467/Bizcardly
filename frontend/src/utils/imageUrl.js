// Image URL Processing & Debugging Utility
// Path: frontend/src/utils/imageUrl.js

import { API_BASE_URL } from '../api/config';

/**
 * Get proper image URL from backend path
 * Handles Cloudinary URLs, local uploads, and relative paths
 */
export const getImageUrl = (imagePath, context = '') => {
  if (!imagePath) {
    console.log(`🖼️  [${context}] No image path provided`);
    return '';
  }

  // Already a full URL (Cloudinary or external)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log(`✅ [${context}] Cloudinary/Full URL:`, imagePath);
    return imagePath;
  }

  // Local upload path with /uploads/
  if (imagePath.startsWith('/uploads/')) {
    const baseUrl = API_BASE_URL.replace('/api', '');
    const fullUrl = `${baseUrl}${imagePath}`;
    console.log(`📁 [${context}] Local upload path:`, {
      original: imagePath,
      base: baseUrl,
      final: fullUrl
    });
    return fullUrl;
  }

  // Relative path without leading slash
  if (!imagePath.startsWith('/')) {
    const baseUrl = API_BASE_URL.replace('/api', '');
    const fullUrl = `${baseUrl}/uploads/${imagePath}`;
    console.log(`📄 [${context}] Relative path:`, {
      original: imagePath,
      final: fullUrl
    });
    return fullUrl;
  }

  // Unknown format
  console.warn(`⚠️  [${context}] Unknown image path format:`, imagePath);
  return imagePath;
};

/**
 * Create image element with error handling
 */
export const createImageElement = (url, options = {}) => {
  const {
    alt = 'Image',
    className = '',
    onLoad = null,
    onError = null,
    context = 'Image'
  } = options;

  const img = document.createElement('img');
  img.alt = alt;
  img.className = className;

  img.onload = () => {
    console.log(`✅ [${context}] Image loaded successfully:`, url);
    if (onLoad) onLoad(img);
  };

  img.onerror = () => {
    console.error(`❌ [${context}] Image failed to load:`, url);
    // Try with retry
    console.log(`🔄 [${context}] Retrying in 2 seconds...`);
    setTimeout(() => {
      console.log(`🔄 [${context}] Retry loading...`);
      img.src = url;
    }, 2000);
    if (onError) onError(img);
  };

  img.src = url;
  return img;
};

/**
 * Format image URL for logging
 */
export const formatImageUrl = (url, maxLength = 50) => {
  if (!url) return '(empty)';
  if (url.length <= maxLength) return url;
  return url.substring(0, maxLength - 3) + '...';
};

/**
 * Validate image URL
 */
export const validateImageUrl = (url, context = '') => {
  console.group(`🔍 Validating image URL [${context}]`);
  
  const checks = {
    'URL exists': !!url,
    'Is string': typeof url === 'string',
    'Not empty': url?.trim().length > 0,
    'Starts with http or /uploads': url?.startsWith('http') || url?.startsWith('/uploads'),
  };

  let allValid = true;
  for (const [check, result] of Object.entries(checks)) {
    console.log(`  ${result ? '✅' : '❌'} ${check}`);
    if (!result) allValid = false;
  }

  console.groupEnd();
  return allValid;
};

export default {
  getImageUrl,
  createImageElement,
  formatImageUrl,
  validateImageUrl
};
