import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('bizcardly_token');
      const savedUser = localStorage.getItem('bizcardly_user');
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          // Verify token with server
          const { data } = await api.get('/auth/me');
          setUser(data.user);
          setBusiness(data.business);
        } catch {
          localStorage.removeItem('bizcardly_token');
          localStorage.removeItem('bizcardly_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (token, userData) => {
    localStorage.setItem('bizcardly_token', token);
    localStorage.setItem('bizcardly_user', JSON.stringify(userData));
    setUser(userData);
    console.log('Token saved to localStorage:', token);
    console.log('User saved to localStorage:', userData);
    
    // Fetch business data after login
    try {
      const { data } = await api.get('/business');
      setBusiness(data.business);
      console.log('Business data fetched:', data.business);
    } catch (err) {
      console.error('Failed to fetch business after login:', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('bizcardly_token');
    localStorage.removeItem('bizcardly_user');
    setUser(null);
    setBusiness(null);
    window.location.href = '/login';
  };

  const refreshBusiness = async () => {
    try {
      const { data } = await api.get('/business');
      setBusiness(data.business);
    } catch (err) {
      console.error('Failed to refresh business:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, business, loading, login, logout, refreshBusiness }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
