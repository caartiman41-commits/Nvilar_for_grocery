import axios from 'axios';

// In a production environment, this would be loaded from react-native-config
const BASE_URL = 'https://api.grezto.com/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    // Logic to add auth token will go here
    return config;
  },
  (error) => Promise.reject(error)
);
