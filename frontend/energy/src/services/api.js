import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Location API
export const locationAPI = {
  getAll: () => api.get('/locations'),
  getLatest: (location) => api.get(`/locations/${location}/latest`),
  getDashboard: (location) => api.get(`/locations/${location}/dashboard`),
  getHistory: (location, metric, params) =>
    api.get(`/locations/${location}/history/${metric}`, { params }),
};

// System API
export const systemAPI = {
  getHealth: () => api.get('/system/health'),
  getStatus: () => api.get('/system/status'),
  triggerPoll: () => api.post('/system/poll'),
};

export default api;
