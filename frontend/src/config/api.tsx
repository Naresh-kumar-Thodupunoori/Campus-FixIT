// API Configuration
// Update this file or use EXPO_PUBLIC_API_BASE_URL environment variable
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default {
  BASE_URL: API_BASE_URL,
  API_URL: `${API_BASE_URL}/api`,
};

