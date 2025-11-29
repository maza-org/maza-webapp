import axios from 'axios';

const baseUrl = 'https://maza-strapi-backend.onrender.com/api';
//production: const baseUrl = 'https://maza-strapi-backend.onrender.com/api';
//stage: const baseUrl = 'https://maza-backend-api.onrender.com/api';
const api = axios.create({
  // baseURL: 'https://api.mazas.org/api',
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export { baseUrl };
export default api;
