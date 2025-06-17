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
});

export { baseUrl };
export default api;
