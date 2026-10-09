import axios from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '../features/auth/authStore';

// Primary connection via adb reverse (localhost:8080) + direct Wi-Fi fallback
export const BASE_URL = 'http://localhost:8080/api';
const FALLBACK_BASE_URL = 'http://192.168.29.55:8080/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 6000,
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

// Response Interceptor: Automatic route failover & error formatting
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;
    if (
      originalConfig &&
      !originalConfig._retriedWithFallback &&
      (error.code === 'ECONNABORTED' || error.message?.includes('Network Error'))
    ) {
      originalConfig._retriedWithFallback = true;
      const altBase =
        originalConfig.baseURL === BASE_URL ? FALLBACK_BASE_URL : BASE_URL;
      originalConfig.baseURL = altBase;
      apiClient.defaults.baseURL = altBase;
      return apiClient.request(originalConfig);
    }
    if (error.code === 'ECONNABORTED' || error.message?.includes('Network Error')) {
      console.warn(`[API NETWORK NOTICE] Go backend at ${BASE_URL} unreachable.`);
    }
    return Promise.reject(error);
  }
);
