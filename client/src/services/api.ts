import axios from 'axios';

let apiURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
if (apiURL.includes('localhost') && window.location.hostname !== 'localhost') {
  apiURL = apiURL.replace('localhost', window.location.hostname);
}

export const api = axios.create({
  baseURL: apiURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inject Bearer token from localStorage for protected routes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
