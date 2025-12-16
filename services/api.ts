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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { baseUrl };
export default api;
