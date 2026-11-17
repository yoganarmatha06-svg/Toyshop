import axios from 'axios';

// In development, use local Vite proxy ('/api'). In production, default to live Render backend if not set.
const defaultBaseUrl = import.meta.env.DEV
  ? '/api'
  : 'https://toyshop-6xha.onrender.com/api';

let rawUrl = (import.meta.env.VITE_API_URL || defaultBaseUrl).trim();

// Strip trailing slashes
rawUrl = rawUrl.replace(/\/+$/, '');

// If it is a full URL (starts with http) and doesn't end with '/api', auto-append '/api'
if (rawUrl.startsWith('http') && !rawUrl.endsWith('/api')) {
  rawUrl = `${rawUrl}/api`;
}

const api = axios.create({
  baseURL: rawUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Ensure withCredentials and attach auth token
api.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
    const adminToken = localStorage.getItem('admin_token');
    const token = adminToken || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Clean error message extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default api;

