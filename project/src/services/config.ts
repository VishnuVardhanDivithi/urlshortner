// API configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getApiUrl = () => API_URL;

export default {
  getApiUrl
};
