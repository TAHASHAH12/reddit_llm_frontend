import axios, { AxiosResponse } from 'axios';
import { ApiResponse, BrandAnalysisResponse, RedditPost } from '../types';

// Use environment variable or fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('🔗 API Base URL:', API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${response.status})`);
    return response;
  },
  (error) => {
    console.error('❌ API Response Error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. The server is taking too long to respond.';
    } else if (error.response?.status === 429) {
      error.message = 'Rate limit exceeded. Please wait a moment before trying again.';
    } else if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.';
    } else if (!error.response) {
      error.message = 'Network error. Please check your connection and try again.';
    }
    
    return Promise.reject(error);
  }
);

export const redditAPI = {
  healthCheck: (): Promise<AxiosResponse<any>> =>
    apiClient.get('/health'),

  analyzeBrandSentiment: (brandName: string, options?: {
    limit?: number;
    timeFilter?: string;
    subreddit?: string;
  }): Promise<AxiosResponse<ApiResponse<BrandAnalysisResponse>>> =>
    apiClient.post('/reddit/analyze/sentiment', {
      brandName,
      ...options,
    }),

  searchBrandMentions: (brandName: string, options?: {
    limit?: number;
    timeFilter?: string;
    subreddit?: string;
    sortBy?: string;
  }): Promise<AxiosResponse<ApiResponse<RedditPost[]>>> =>
    apiClient.get('/reddit/search/brand', {
      params: { brandName, ...options }
    }),

  searchKeywords: (keywords: string[], options?: {
    limit?: number;
    timeFilter?: string;
    subreddit?: string;
    sortBy?: string;
  }): Promise<AxiosResponse<ApiResponse<RedditPost[]>>> =>
    apiClient.post('/reddit/search/keywords', {
      keywords,
      ...options,
    }),

  getSubredditPosts: (subredditName: string, options?: {
    limit?: number;
    sortBy?: string;
  }): Promise<AxiosResponse<ApiResponse<RedditPost[]>>> =>
    apiClient.get(`/reddit/subreddit/${subredditName}`, {
      params: options
    }),
};

export default apiClient;
