// Determine API URL based on environment
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  if (envUrl) {
    console.log('✓ API URL from environment:', envUrl);
    return envUrl;
  }

  // Check if running locally
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🏠 Running locally, using http://localhost:5000/api');
    return 'http://localhost:5000/api';
  }

  // Production fallback
  console.log('🌐 Production environment, using production API URL');
  return 'https://bizcardly-1.onrender.com/api';
};

export const API_BASE_URL = getApiUrl();
console.log('📍 API Base URL:', API_BASE_URL);

export const apiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
