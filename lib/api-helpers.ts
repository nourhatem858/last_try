/**
 * API Helper Functions for Type-Safe Axios Calls
 * 
 * These helpers provide consistent error handling and type safety
 * across all API calls in the application.
 */

import axios from 'axios';

/**
 * Type guard to check if error is an Axios error
 */
export function isAxiosError(error: unknown): boolean {
  return axios.isAxiosError(error);
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    // Axios error - check response data first
    const responseError = error.response?.data?.error;
    if (responseError) return responseError;
    
    const responseMessage = error.response?.data?.message;
    if (responseMessage) return responseMessage;
    
    // Network or timeout errors
    if (error.code === 'ECONNABORTED') {
      return 'Request timeout - Server took too long to respond';
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Network error - Please check your connection';
    }
    
    // HTTP status errors
    if (error.response?.status === 401) {
      return 'Unauthorized - Please log in again';
    }
    if (error.response?.status === 403) {
      return 'Access denied';
    }
    if (error.response?.status === 404) {
      return 'Resource not found';
    }
    if (error.response?.status === 500) {
      return 'Server error - Please try again later';
    }
    
    // Fallback to error message
    return error.message || 'An error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Handle API errors consistently
 * 
 * @param error - The error to handle
 * @param fallbackMessage - Optional fallback message
 * @returns Error message string
 */
export function handleApiError(error: unknown, fallbackMessage = 'Operation failed'): string {
  const message = getErrorMessage(error);
  console.error('API Error:', message, error);
  return message || fallbackMessage;
}

/**
 * Type-safe wrapper for GET requests
 */
export async function apiGet<T>(
  axiosInstance: typeof axios,
  url: string,
  config?: any
): Promise<T> {
  try {
    const response = await axiosInstance.get<T>(url, config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error, `Failed to fetch from ${url}`));
  }
}

/**
 * Type-safe wrapper for POST requests
 */
export async function apiPost<T>(
  axiosInstance: typeof axios,
  url: string,
  data?: any,
  config?: any
): Promise<T> {
  try {
    const response = await axiosInstance.post<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error, `Failed to post to ${url}`));
  }
}

/**
 * Type-safe wrapper for PUT requests
 */
export async function apiPut<T>(
  axiosInstance: typeof axios,
  url: string,
  data?: any,
  config?: any
): Promise<T> {
  try {
    const response = await axiosInstance.put<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error, `Failed to update ${url}`));
  }
}

/**
 * Type-safe wrapper for DELETE requests
 */
export async function apiDelete<T>(
  axiosInstance: typeof axios,
  url: string,
  config?: any
): Promise<T> {
  try {
    const response = await axiosInstance.delete<T>(url, config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error, `Failed to delete from ${url}`));
  }
}

/**
 * Type-safe wrapper for PATCH requests
 */
export async function apiPatch<T>(
  axiosInstance: typeof axios,
  url: string,
  data?: any,
  config?: any
): Promise<T> {
  try {
    const response = await axiosInstance.patch<T>(url, data, config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error, `Failed to patch ${url}`));
  }
}
