import { getBackendUrl } from './config';
import { auth } from './firebase';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  message?: any;
  data?: T;
  [key: string]: any;
}

/**
 * Enterprise Centralized API Client (Flipkart / Meesho Standard)
 * - Automatically injects Firebase ID Token (Bearer Token)
 * - Automatically attaches active user ID header
 * - Normalizes query params and base URLs
 * - Handles errors gracefully without crashing components
 */
class ApiClient {
  private getBaseUrl(): string {
    return getBackendUrl();
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (typeof window !== 'undefined') {
      if (auth && auth.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          if (token) {
            headers['Authorization'] = `Bearer ${token}`;
          }
          if (auth.currentUser.uid) {
            headers['x-user-id'] = auth.currentUser.uid;
          }
        } catch (err) {
          console.warn('ApiClient: Failed to acquire auth token:', err);
        }
      }
      if (!headers['x-user-id']) {
        const storedUid = localStorage.getItem('mitreno_user_id') || 
                          localStorage.getItem('mitreno_seller_user_id') ||
                          'KD56AHEqvOWX322JKlVB4jkMoju2';
        if (storedUid) {
          headers['x-user-id'] = storedUid;
        }
      }
    }

    return headers;
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const baseUrl = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = new URL(`${baseUrl}${cleanEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          url.searchParams.append(key, String(val));
        }
      });
    }

    return url.toString();
  }

  public async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { params, headers: customHeaders, ...fetchOpts } = options;
    const url = this.buildUrl(endpoint, params);
    const authHeaders = await this.getAuthHeaders();

    const mergedHeaders: Record<string, string> = {
      ...authHeaders,
      ...(customHeaders as Record<string, string>),
    };

    // If body is FormData, remove Content-Type so browser sets boundary
    if (fetchOpts.body instanceof FormData) {
      delete mergedHeaders['Content-Type'];
    }

    try {
      const response = await fetch(url, {
        ...fetchOpts,
        headers: mergedHeaders,
      });

      // Attempt parsing JSON
      let data: any;
      try {
        data = await response.json();
      } catch {
        data = { success: response.ok, statusText: response.statusText };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}: ${response.statusText}`,
          statusCode: response.status,
          ...data,
        };
      }

      return data;
    } catch (err: any) {
      console.error(`ApiClient Error [${endpoint}]:`, err);
      return {
        success: false,
        error: err.message || 'Network request failed. Please check connection.',
      };
    }
  }

  public get<T = any>(endpoint: string, params?: Record<string, any>, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', params, ...options });
  }

  public post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    });
  }

  public put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    });
  }

  public delete<T = any>(endpoint: string, params?: Record<string, any>, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', params, ...options });
  }
}

export const apiClient = new ApiClient();
