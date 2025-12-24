/**
 * Axios Configuration - Base setup for API calls
 */

import axios from 'axios';

// Base API URL - For Next.js API routes, use localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000, // 5 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add JWT token to all requests
axiosInstance.interceptors.request.use(
  (config: any) => {
    // Only access localStorage in browser
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    
    return config;
  },
  (error: unknown) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Enhanced error handling with comprehensive logging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error: unknown) => {
    // Comprehensive error logging - handles all error types safely
    console.group('❌ API Error Details');
    
    // Check if it's an Axios error
    if (axios.isAxiosError(error)) {
      console.log('Error Type:', 'AxiosError');
      console.log('Message:', error.message);
      console.log('Code:', error.code || 'N/A');
      
      // Request details (if available)
      if (error.config) {
        const fullURL = error.config.baseURL 
          ? `${error.config.baseURL}${error.config.url}`
          : error.config.url;
          
        console.log('Request:', {
          method: error.config.method?.toUpperCase(),
          url: error.config.url,
          baseURL: error.config.baseURL,
          fullURL,
          timeout: error.config.timeout,
        });
      } else {
        console.warn('⚠️  No request config (request setup failed)');
      }
      
      // Response details (if available)
      if (error.response) {
        console.log('Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
      } else {
        console.warn('⚠️  No response received');
        
        // Diagnose network issues
        if (error.code === 'ECONNABORTED') {
          console.error('🕐 Request timeout - Server took too long to respond');
        } else if (error.code === 'ERR_NETWORK') {
          console.error('🌐 Network error - Check if server is running');
        } else if (error.message === 'Network Error') {
          console.error('🌐 Network error - Possible causes:');
          console.error('   - Server not running (check npm run dev)');
          console.error('   - CORS blocking request');
          console.error('   - Wrong baseURL or API path');
        } else {
          console.error('🔌 Connection failed - Server unreachable');
        }
      }
      
      // Handle specific HTTP status codes
      if (error.response?.status === 401) {
        console.warn('🔒 Unauthorized - Token expired or invalid');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      } else if (error.response?.status === 403) {
        console.error('🚫 Forbidden - Access denied');
      } else if (error.response?.status === 404) {
        console.error('🔍 Not Found - API route does not exist');
        console.error('   Check if the API route file exists');
      } else if (error.response?.status === 500) {
        console.error('💥 Server Error - Check server logs');
      } else if (error.response?.status === 422) {
        console.error('📝 Validation Error - Check request data');
      }
      
    } else if (error instanceof Error) {
      // Standard JavaScript error
      console.log('Error Type:', 'Standard Error');
      console.log('Message:', error.message);
      console.log('Stack:', error.stack);
    } else {
      // Unknown error type
      console.log('Error Type:', 'Unknown');
      console.log('Error:', error);
    }
    
    console.groupEnd();
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
