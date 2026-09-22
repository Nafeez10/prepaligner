import axios from 'axios';
import { StorageKeys } from '@/enum/StorageKeys';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(StorageKeys.TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 if it's not the login endpoint to prevent loops
    if (error.response?.status === 401 && !error.config.url?.includes('/auth/login')) {
      localStorage.removeItem(StorageKeys.TOKEN);
      setTimeout(() => {
        window.dispatchEvent(new Event('auth:unauthorized'));
      }, 1000);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
