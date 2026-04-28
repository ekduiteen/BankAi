import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Set Content-Type for non-FormData requests
    // For FormData, let axios/browser handle it automatically with boundary
    if (config.data instanceof FormData) {
      // Don't set Content-Type for FormData - let browser handle it with proper boundary
      delete config.headers['Content-Type'];
      config.headers['Content-Type'] = undefined;
      console.log('Sending FormData upload:', config.method, config.url);
    } else {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
