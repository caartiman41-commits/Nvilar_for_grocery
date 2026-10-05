import axios from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '../features/auth/authStore';

// Uses localhost:8080/api which bridges seamlessly via 'adb reverse tcp:8080 tcp:8080'
export const BASE_URL = 'http://localhost:8080/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export default apiClient;

// Request Interceptor: Attach Auth Token and User ID if available
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const state = useAuthStore.getState();
      const token = state.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (state.user?.uid) {
        config.headers['X-User-ID'] = state.user.uid;
      }
    } catch {
      // Ignore token resolution error
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Graceful fallback and error formatting
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend is unreachable (offline development resilience)
    if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
      console.warn(`[API NETWORK NOTICE] Go backend at ${BASE_URL} unreachable. Operating in resilient offline mode.`);
    }
    return Promise.reject(error);
  }
);
