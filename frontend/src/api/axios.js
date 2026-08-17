import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bizcardly.onrender.com/api',
  // Don't set default Content-Type to allow FormData to work properly
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bizcardly_token');
    console.log('Axios request interceptor - token:', token ? 'exists' : 'missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token added to request');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Axios response error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('bizcardly_token');
      localStorage.removeItem('bizcardly_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
