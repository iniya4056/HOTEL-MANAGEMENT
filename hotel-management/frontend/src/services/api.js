import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({ baseURL: `${API_URL}/api` });

export const imageUrl = (path) => (path ? `${API_URL}${path}` : '/placeholder.svg');

export const toErrorPayload = (err) => ({
  message: err.response?.data?.message || err.message || 'Something went wrong',
  errors: err.response?.data?.errors || {},
});

export default api;
