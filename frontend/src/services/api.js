import axios from 'axios';

// Determine backend URL dynamically based on frontend origin if not provided via environment variables.
const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const { protocol, hostname, port } = window.location;
  // If the app is run from a standard port or behind a reverse proxy (e.g. Nginx),
  // we route requests to the relative path /api
  if (port === '' || port === '80' || port === '443') {
    return '/api';
  }
  
  // Otherwise, default to port 5000 on the same host (standard development setup)
  return `${protocol}//${hostname}:5000/api`;
};

// Create API client pointing to the backend Express server
const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to append JWT bearer tokens dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle session expiry or unauthorized status
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Token has expired or is invalid - purge session and redirect to login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/' && currentPath !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?message=session_expired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
