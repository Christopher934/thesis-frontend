// Utility functions for authentication with fallback mechanisms

/**
 * Fetch data with authentication token and fallback to local mock data if the API fails
 * @param url The URL to fetch data from
 * @param fallbackUrl The URL to fallback to if the API request fails
 * @returns The fetched data or fallback data
 */
export async function fetchWithAuthAndFallback<T>(
  url: string,
  fallbackUrl: string
): Promise<T> {
  // Get auth token from localStorage
  const token = localStorage.getItem("token");
  
  try {
    // If we have a token, attempt to use it
    if (token) {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // If response is successful, return the data
      if (response.ok) {
        const data = await response.json();
        return data as T;
      }
      
      // If unauthorized, could handle token refresh or logout here
      if (response.status === 401) {
        console.warn('Authentication token expired or invalid');
      }
    }
    
    console.warn(`API request failed or no token available, falling back to ${fallbackUrl}`);
    
    // Fallback to local mock data
    const fallbackResponse = await fetch(fallbackUrl);
    if (!fallbackResponse.ok) {
      throw new Error(`Failed to fetch fallback data from ${fallbackUrl}`);
    }
    
    const fallbackData = await fallbackResponse.json();
    return fallbackData as T;
  } catch (error) {
    console.error("Error fetching data:", error);
    
    // Still try the fallback if the main request throws an error
    console.warn(`API request error, falling back to ${fallbackUrl}`);
    const fallbackResponse = await fetch(fallbackUrl);
    const fallbackData = await fallbackResponse.json();
    return fallbackData as T;
  }
}