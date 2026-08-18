import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
  // Don't set default Content-Type to allow FormData to work properly
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bizcardly_token');
    console.log(`📤 [${config.method.toUpperCase()}] ${config.url}`);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✓ Token added to request');
    } else {
      console.warn('⚠️  No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response received:`, response.status, response.data?.message || '');
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    console.error(`❌ API Error [${status}]:`, message);
    console.error('Full error:', error.response?.data || error);
    
    if (status === 401) {
      console.warn('🔐 Unauthorized - logging out user');
      localStorage.removeItem('bizcardly_token');
      localStorage.removeItem('bizcardly_user');
      window.location.href = '/login';
    }
    
    if (status === 403) {
      console.warn('🚫 Forbidden access');
    }
    
    if (status === 500) {
      console.error('🔥 Server error - check backend logs');
    }
    
    return Promise.reject(error);
  }
);

export default api;
