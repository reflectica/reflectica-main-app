/**
 * API Configuration for secure HTTPS endpoints
 * HIPAA Compliance: Ensures all API calls use secure HTTPS connections
 */

import Config from 'react-native-config';

// Default to secure production API endpoint
const DEFAULT_API_BASE_URL = 'https://api.reflectica.com';

// Get API base URL from environment config, fallback to default
export const API_BASE_URL = Config.API_BASE_URL || DEFAULT_API_BASE_URL;

// API Endpoints
export const API_ENDPOINTS = {
  CHAT: `${API_BASE_URL}/chat`,
  END_SESSION: `${API_BASE_URL}/session/endSession`,
  // Add other endpoints as needed
};

// HIPAA Compliance: Security headers for all API requests
export const SECURITY_HEADERS = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'X-API-Version': '1.0',
  // Add additional security headers as needed
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

/**
 * Validates that the API URL is using HTTPS
 * @param url - The URL to validate
 * @throws Error if URL is not HTTPS
 */
export const validateSecureUrl = (url: string): void => {
  if (!url.startsWith('https://')) {
    throw new Error(`HIPAA Compliance Error: API endpoint must use HTTPS. Received: ${url}`);
  }
};

/**
 * Creates a secure axios configuration with HIPAA compliance headers
 * @param additionalHeaders - Any additional headers to include
 * @returns Axios configuration object
 */
export const createSecureApiConfig = (additionalHeaders: Record<string, string> = {}) => {
  // Validate that base URL is secure
  validateSecureUrl(API_BASE_URL);

  return {
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 seconds timeout
    headers: {
      ...SECURITY_HEADERS,
      ...additionalHeaders,
    },
    // Additional security configurations
    withCredentials: false, // Don't send cookies for security
    maxRedirects: 0, // Don't follow redirects for security
  };
};

/**
 * Gets the appropriate API endpoint URL and validates it's secure
 * @param endpoint - The endpoint key from API_ENDPOINTS
 * @returns Secure HTTPS URL
 */
export const getSecureEndpoint = (endpoint: keyof typeof API_ENDPOINTS): string => {
  const url = API_ENDPOINTS[endpoint];
  validateSecureUrl(url);
  return url;
};