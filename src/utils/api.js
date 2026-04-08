import axios from 'axios';

const API_BASE_URL = 'https://job-ael6.onrender.com/api';

const api = axios.create({ baseURL: API_BASE_URL });

// Request interceptor — attach token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers['x-auth-token'] = token;
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
