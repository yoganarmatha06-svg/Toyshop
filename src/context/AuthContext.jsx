import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedAdmin = localStorage.getItem('admin_user');
      if (savedAdmin) return JSON.parse(savedAdmin);
      const saved = localStorage.getItem('userInfo');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('admin_token') || localStorage.getItem('token') || null;
  });

  // If admin session exists in storage, start loading as false so refresh never flashes login page!
  const [loading, setLoading] = useState(() => {
    try {
      const savedAdmin = localStorage.getItem('admin_user');
      const savedAdminToken = localStorage.getItem('admin_token');
      if (savedAdmin && savedAdminToken) {
        return false;
      }
    } catch {
      // ignore
    }
    return true;
  });

  // Persistent Session Verification on Initial Mount & Refresh
  useEffect(() => {
    let isMounted = true;

    const checkAuthSession = async () => {
      const isCurrentAdminRoute = window.location.pathname.startsWith('/admin');
      const savedAdminToken = localStorage.getItem('admin_token');
      const savedAdminUser = (() => {
        try {
          const a = localStorage.getItem('admin_user');
          return a ? JSON.parse(a) : null;
        } catch {
          return null;
        }
      })();

      // Fast-path: Admin credentials present in local storage
      if (savedAdminUser && savedAdminUser.role === 'admin' && savedAdminToken) {
        if (isMounted) {
          setUser(savedAdminUser);
          setLoading(false);
        }

        // Silent server session validation in background
        try {
          const { data } = await api.get('/auth/verify-admin-session');
          if (isMounted && data.authenticated && data.user) {
            setUser(data.user);
            localStorage.setItem('admin_user', JSON.stringify(data.user));
            localStorage.setItem('userInfo', JSON.stringify(data.user));
          }
        } catch (err) {
          const status = err.response?.status;
          // ONLY clear session if server explicitly rejects with 401 or 403
          if (status === 401 || status === 403) {
            console.warn('Admin session expired or revoked:', err.message);
            if (isMounted) {
              setUser(null);
              localStorage.removeItem('admin_user');
              localStorage.removeItem('admin_token');
              localStorage.removeItem('userInfo');
            }
          } else {
            // Server waking up / network glitch -> preserve session!
            console.warn('Backend server connecting, preserving admin session:', err.message);
          }
        }
        return;
      }

      // No saved admin token, verify via HTTP-only cookie on admin route
      if (isCurrentAdminRoute) {
        try {
          const { data } = await api.get('/auth/verify-admin-session');
          if (isMounted && data.authenticated && data.user) {
            setUser(data.user);
            localStorage.setItem('admin_user', JSON.stringify(data.user));
            localStorage.setItem('userInfo', JSON.stringify(data.user));
          } else if (isMounted) {
            setUser(null);
            localStorage.removeItem('admin_user');
            localStorage.removeItem('admin_token');
          }
        } catch {
          if (isMounted) {
            setUser(null);
            localStorage.removeItem('admin_user');
            localStorage.removeItem('admin_token');
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
        return;
      }

      // Standard user session verification
      try {
        const { data } = await api.get('/auth/profile');
        if (isMounted && data && data._id) {
          setUser(data);
          localStorage.setItem('userInfo', JSON.stringify(data));
        }
      } catch {
        // User not logged in
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuthSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const userData = {
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone,
    };
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
    }
    return data;
  };

  const adminLogin = async (email, password) => {
    // Backend sets secure HTTP-only cookie (adminToken & token)
    const { data } = await api.post('/auth/admin-login', { email, password });
    const userData = {
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone,
    };
    setUser(userData);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    localStorage.setItem('userInfo', JSON.stringify(userData));
    if (data.token) {
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('token', data.token);
      setToken(data.token);
    }
    return data;
  };

  const register = async (name, email, password, phone) => {
    const { data } = await api.post('/auth/register', { name, email, password, phone });
    const userData = {
      _id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone,
    };
    setUser(userData);
    localStorage.setItem('userInfo', JSON.stringify(userData));
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
    }
    return data;
  };

  const logout = async () => {
    try {
      // Clear secure HTTP-only cookies on backend
      await api.post('/auth/logout');
    } catch (err) {
      console.warn('Server logout notice:', err.message);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('admin_user');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('customerDetails');
    }
  };

  const updateProfile = async (userData) => {
    const { data } = await api.put('/auth/profile', userData);
    setUser((prev) => ({ ...prev, ...data }));
    localStorage.setItem('userInfo', JSON.stringify({ ...user, ...data }));
    return data;
  };

  const setAuthData = (userData, userToken) => {
    setUser(userData);
    if (userToken) {
      setToken(userToken);
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

export default AuthContext;

