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
    if (!(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    } else {
      // Ensure FormData is handled correctly - delete Content-Type to let browser set it
      delete config.headers['Content-Type'];
    }
    if (config.data instanceof FormData) {
      console.log('Sending FormData upload:', config.method, config.url);
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
