import axios from 'axios';

const baseUrl = 'https://content.stage.mazas.org/api';
//const baseUrl = 'https://maza-strapi-backend.onrender.com/api';
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
