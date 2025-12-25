// src/services/api.ts
import axios, { InternalAxiosRequestConfig } from 'axios';

// Lấy base path, nếu không có thì mặc định là '/'
const basePath = import.meta.env.VITE_BASE_PATH;
const api = axios.create({
baseURL: basePath === '/' ? '/api' : `${basePath}api`,  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');

  if (token && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});



export default api;
