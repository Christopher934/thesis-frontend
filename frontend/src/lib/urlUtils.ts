/**
 * Utility function to safely join API URL with endpoint path
 * Prevents double slashes in URLs when the base URL might end with a slash
 * Handles various URL formats and edge cases
 * 
 * @param baseUrl - The base API URL (e.g., 'http://localhost:3004')
 * @param endpoint - The API endpoint starting with '/' (e.g., '/auth/login')
 * @returns Properly joined URL
 */
export function joinUrl(baseUrl: string, endpoint: string): string {
  // Handle empty or null input
  if (!baseUrl) return '';
  if (!endpoint) return baseUrl;
  
  // Standardize inputs
  const cleanBaseUrl = baseUrl.trim().replace(/\/+$/, ''); // Remove trailing slashes
  let cleanEndpoint = endpoint.trim();
  if (!cleanEndpoint.startsWith('/')) cleanEndpoint = '/' + cleanEndpoint;
  
  // Handle special case for debug logging
  console.log(`Joining URL: Base=${cleanBaseUrl}, Endpoint=${cleanEndpoint}`);
  
  // Return properly joined URL
  return `${cleanBaseUrl}${cleanEndpoint}`;
}
