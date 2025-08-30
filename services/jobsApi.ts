import axios from 'axios';

const API_BASE_URL = 'https://www.emprego.co.mz/wp-api';

const jobsApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    accept: 'application/json, text/javascript, */*; q=0.01',
    'accept-language': 'en-US,en;q=0.9',
    'sec-ch-ua': '"Not(A:Brand";v="99", "Google Chrome";v="133", "Chromium";v="133"',
    'sec-ch-ua-mobile': '?1',
    'sec-ch-ua-platform': '"Android"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'x-requested-with': 'XMLHttpRequest',
  },
  withCredentials: true,
});

jobsApi.interceptors.request.use(
  (config) => {
    console.log('Jobs API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Jobs API Request Error:', error);
    return Promise.reject(error);
  }
);

jobsApi.interceptors.response.use(
  (response) => {
    console.log('Jobs API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Jobs API Response Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

export default jobsApi;
