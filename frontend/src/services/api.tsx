import axios from 'axios';
import { Platform } from 'react-native';

// Get API base URL from environment or use default
// For mobile devices, localhost won't work - use your computer's IP address
const getApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  
  if (envUrl) {
    return envUrl;
  }
  
  // On mobile (not web), localhost won't work - use IP address
  
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiBaseUrl();

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const clearAuthToken = () => {
  authToken = null;
};

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

// API configuration loaded

api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network errors (common on mobile when API URL is wrong)
    if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
      console.error(
        '❌ Cannot connect to backend server. ' +
        'Make sure:\n' +
        '1. Backend server is running on port 5000\n' +
        '2. EXPO_PUBLIC_API_BASE_URL is set correctly\n' +
        '3. For mobile devices, use your computer\'s IP (not localhost)\n' +
        `   Current API URL: ${API_BASE_URL}`
      );
      error.userMessage = 
        Platform.OS === 'web' 
          ? 'Cannot connect to server. Make sure the backend is running.'
          : 'Cannot connect to server. Check your network connection and API configuration.';
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid - clear token
      clearAuthToken();
    }
    
    return Promise.reject(error);
  }
);

export default api;


