import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('userInfo');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Load and verify user profile if token exists
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const { data } = await api.get('/auth/profile');
          setUser((prev) => ({ ...prev, ...data }));
          localStorage.setItem('userInfo', JSON.stringify({ ...user, ...data }));
        } catch (err) {
          console.warn('Auth token expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const adminLogin = async (email, password) => {
    const { data } = await api.post('/auth/admin-login', { email, password });
    setUser(data);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const register = async (name, email, password, phone) => {
    const { data } = await api.post('/auth/register', { name, email, password, phone });
    setUser(data);
    setToken(data.token);
    localStorage.setItem('token', data.token);
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('customerDetails');
  };

  const updateProfile = async (userData) => {
    const { data } = await api.put('/auth/profile', userData);
    setUser((prev) => ({ ...prev, ...data }));
    if (data.token) {
      setToken(data.token);
      localStorage.setItem('token', data.token);
    }
    localStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.post('/auth/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (data.user) {
      setUser((prev) => ({ ...prev, ...data.user }));
      localStorage.setItem('userInfo', JSON.stringify({ ...user, ...data.user }));
    }
    return data;
  };

  const setAuthData = (userData, userToken) => {
    setUser(userData);
    if (userToken) {
      setToken(userToken);
      localStorage.setItem('token', userToken);
    }
    localStorage.setItem('userInfo', JSON.stringify(userData));
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        isAuthenticated,
        login,
        adminLogin,
        register,
        logout,
        updateProfile,
        uploadAvatar,
        setAuthData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

