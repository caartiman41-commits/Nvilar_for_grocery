import axios from 'axios';
import { Platform } from 'react-native';
import { useAuthStore } from '../features/auth/authStore';

// PC Host IP on local Wi-Fi network so physical Android phones connected to Wi-Fi can reach the backend.
const PC_DEV_IP = '10.121.102.31';

// For Android physical devices on Wi-Fi, use PC_DEV_IP:8080.
// For Android Emulator, 10.0.2.2:8080 works.
export const BASE_URL = Platform.OS === 'android'
  ? `http://${PC_DEV_IP}:8080/api`
  : 'http://localhost:8080/api';

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
