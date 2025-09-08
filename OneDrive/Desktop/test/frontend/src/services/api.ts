import axios from 'axios';
import type { CreateShortUrlRequest, CreateShortUrlResponse, ShortUrlStats, ApiError } from '../types';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
      data: config.data,
      params: config.params,
    });
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} ${response.config.url}`, {
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('[API Response Error]', {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export const urlShortenerApi = {
  // Create short URL
  createShortUrl: async (data: CreateShortUrlRequest): Promise<CreateShortUrlResponse> => {
    try {
      const response = await api.post<CreateShortUrlResponse>('/shorturls', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ApiError;
      }
      throw {
        error: 'NetworkError',
        message: 'Failed to connect to server',
        statusCode: 0,
      } as ApiError;
    }
  },

  // Get statistics for a short URL
  getStats: async (shortcode: string): Promise<ShortUrlStats> => {
    try {
      const response = await api.get<ShortUrlStats>(`/shorturls/${shortcode}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        throw error.response.data as ApiError;
      }
      throw {
        error: 'NetworkError',
        message: 'Failed to connect to server',
        statusCode: 0,
      } as ApiError;
    }
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; timestamp: string; uptime: number }> => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error: any) {
      throw {
        error: 'NetworkError',
        message: 'Backend server is not available',
        statusCode: 0,
      } as ApiError;
    }
  },
};

export default api;
