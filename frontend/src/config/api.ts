/**
 * API configuration module for the application
 * 
 * This module provides centralized configuration for API endpoints
 * and includes functionality to handle connection failures gracefully.
 */

// List of possible API endpoints in order of preference
const API_ENDPOINTS = [
  process.env.NEXT_PUBLIC_API_URL,
  'http://localhost:3004'
].filter(Boolean) as string[]; // Remove undefined and type as string array

/**
 * Get the current primary API endpoint
 * @returns The currently configured primary API endpoint
 */
export const getApiUrl = (): string => {
  return API_ENDPOINTS[0];
};

/**
 * Test if an API endpoint is reachable
 * @param url The URL to test
 * @param timeout Timeout in milliseconds
 * @returns Promise that resolves to true if reachable, false otherwise
 */
export const isApiReachable = async (url: string, timeout = 5000): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(`${url}/health`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn(`API endpoint ${url} is not reachable:`, error);
    return false;
  }
};

/**
 * Find the first reachable API endpoint from the configured list
 * @returns Promise that resolves to the first reachable endpoint or null if none are reachable
 */
export const findReachableApiEndpoint = async (): Promise<string | null> => {
  for (const endpoint of API_ENDPOINTS) {
    if (await isApiReachable(endpoint)) {
      return endpoint;
    }
  }
  return null;
};

/**
 * Default export for easy importing
 */
export default {
  getApiUrl,
  isApiReachable,
  findReachableApiEndpoint
};
