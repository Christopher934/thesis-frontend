/**
 * Utility for fetching data with fallback to mock data when API is unreachable
 */

interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Fetch data from an API with fallback to mock data
 * 
 * @param apiUrl The API URL to fetch from
 * @param endpoint The API endpoint
 * @param mockPath Path to mock data file
 * @param options Fetch options
 * @param transformMockData Optional function to transform mock data
 * @returns The fetched data or transformed mock data
 */
export const fetchWithFallback = async <T>(
  apiUrl: string,
  endpoint: string,
  mockPath: string,
  options: FetchOptions = {},
  transformMockData?: (data: any) => T
): Promise<T> => {
  const { timeout = 10000, ...fetchOptions } = options;
  
  try {
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Try to fetch from API
    const response = await fetch(`${apiUrl}${endpoint}`, {
      ...fetchOptions,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.warn(`Failed to fetch from API (${apiUrl}${endpoint}):`, error);
    console.log(`Falling back to mock data: ${mockPath}`);
    
    // Fallback to mock data
    try {
      const mockResponse = await fetch(mockPath);
      
      if (!mockResponse.ok) {
        throw new Error(`Failed to fetch mock data: ${mockResponse.status}`);
      }
      
      const mockData = await mockResponse.json();
      
      // Transform mock data if transformer provided
      if (transformMockData) {
        return transformMockData(mockData);
      }
      
      return mockData;
    } catch (mockError) {
      console.error("Error fetching mock data:", mockError);
      throw new Error(`Failed to fetch data from API and mock source: ${mockError}`);
    }
  }
};

export default fetchWithFallback;
