/**
 * WooCommerce REST API Base Functions
 *
 * Core API functions for making authenticated requests to the WooCommerce REST API v3.
 * Handles authentication, caching, error handling, and response parsing.
 */

import { WC_API_CONFIG, getWooCommerceAuthHeader, buildQueryString } from './config';
import type { WooCommerceError } from '@/types/woocommerce';
import { errorTracker } from '@/lib/error-tracking';

/**
 * Custom error class for WooCommerce API errors
 */
export class WooCommerceAPIError extends Error {
  status: number;
  code: string;
  details?: Record<string, any>;

  constructor(status: number, message: string, code: string = 'woocommerce_api_error', details?: Record<string, any>) {
    super(message);
    this.name = 'WooCommerceAPIError';
    this.status = status;
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, WooCommerceAPIError);
    }
  }
}

/**
 * Parse WooCommerce error response
 */
function parseWooCommerceError(status: number, errorData: any): WooCommerceAPIError {
  if (errorData && typeof errorData === 'object') {
    const wcError = errorData as WooCommerceError;
    return new WooCommerceAPIError(
      status,
      wcError.message || 'WooCommerce API request failed',
      wcError.code || 'woocommerce_api_error',
      wcError.data?.details
    );
  }

  return new WooCommerceAPIError(status, 'WooCommerce API request failed');
}

/**
 * Timeout wrapper for fetch requests
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 15000
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`);
    }
    throw error;
  }
}

/**
 * Retry logic with exponential backoff
 */
async function fetchWithRetry<T>(
  fetchFn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fetchFn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on authentication errors (401, 403) or client errors (4xx)
      if (error instanceof WooCommerceAPIError) {
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }
      }

      // Don't retry on the last attempt
      if (attempt === maxRetries - 1) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`API request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Generic WooCommerce API fetch function with authentication
 *
 * This is a server-side only function due to API credentials.
 * For client-side requests, use Next.js API routes.
 *
 * @param endpoint - API endpoint (e.g., '/products' or '/products/123')
 * @param options - Fetch options
 * @returns Parsed JSON response
 */
export async function fetchWooCommerceAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Validate that we're running server-side
  if (typeof window !== 'undefined') {
    throw new Error(
      'fetchWooCommerceAPI should only be called server-side. Use Next.js API routes for client-side requests.'
    );
  }

  const url = `${WC_API_CONFIG.baseUrl}${endpoint}`;

  return fetchWithRetry(async () => {
    try {
      // Get authentication header
      const authHeader = getWooCommerceAuthHeader();

      // Merge headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
        'User-Agent': 'IdealLivs-Frontend/1.0',
        ...options.headers,
      };

      // Make the request with timeout
      const response = await fetchWithTimeout(url, {
        ...options,
        headers,
      }, 20000); // Increased to 20 second timeout

      // Handle non-OK responses
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: response.statusText };
        }

        // Log authentication errors with more detail
        if (response.status === 401) {
          console.error('WooCommerce API 401 Unauthorized:', {
            endpoint,
            url,
            errorData,
            hasConsumerKey: !!process.env.WORDPRESS_CONSUMER_KEY,
            hasConsumerSecret: !!process.env.WORDPRESS_CONSUMER_SECRET,
          });

          // Track auth errors
          errorTracker.captureAPIError(
            endpoint,
            401,
            'WooCommerce authentication failed',
            { errorData, url }
          );
        }

        throw parseWooCommerceError(response.status, errorData);
      }

      // Parse and return JSON
      const data = await response.json();
      return data as T;

    } catch (error) {
      // Re-throw WooCommerceAPIError
      if (error instanceof WooCommerceAPIError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new WooCommerceAPIError(
          0,
          `Network error: ${error.message}`,
          'network_error'
        );
      }

      // Handle timeout errors
      if (error instanceof Error && error.message.includes('timeout')) {
        errorTracker.captureTimeout(endpoint, 20000, { url });
        throw new WooCommerceAPIError(
          0,
          `Request timeout: ${error.message}`,
          'timeout_error'
        );
      }

      // Handle unknown errors
      throw new WooCommerceAPIError(
        500,
        error instanceof Error ? error.message : 'Unknown error occurred',
        'unknown_error'
      );
    }
  }, 5, 2000); // Retry up to 5 times with 2s initial delay
}

/**
 * Fetch with caching support using Next.js cache
 *
 * @param endpoint - API endpoint
 * @param cacheTime - Cache duration in seconds (0 = no cache)
 * @param tags - Cache tags for granular revalidation
 * @param options - Additional fetch options
 * @returns Parsed JSON response
 */
export async function fetchWooCommerceCached<T>(
  endpoint: string,
  cacheTime: number = WC_API_CONFIG.cache.products,
  tags: string[] = ['woocommerce'],
  options: RequestInit = {}
): Promise<T> {
  const mergedOptions: RequestInit = {
    ...options,
    next: {
      revalidate: cacheTime,
      tags: [...tags, 'woocommerce'],
      ...options.next,
    },
  };

  return fetchWooCommerceAPI<T>(endpoint, mergedOptions);
}

/**
 * Fetch paginated data with headers
 *
 * Returns both data and pagination info from response headers
 */
export async function fetchWooCommercePaginated<T>(
  endpoint: string,
  params: Record<string, any> = {},
  cacheTime?: number,
  tags?: string[]
): Promise<{
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}> {
  // Build query string
  const queryString = buildQueryString({
    per_page: params.per_page || WC_API_CONFIG.defaults.perPage,
    page: params.page || 1,
    ...params,
  });

  const url = `${WC_API_CONFIG.baseUrl}${endpoint}${queryString}`;

  return fetchWithRetry(async () => {
    try {
      const authHeader = getWooCommerceAuthHeader();

      const fetchOptions: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
          'User-Agent': 'IdealLivs-Frontend/1.0',
        },
      };

      // Add caching if specified
      if (cacheTime !== undefined) {
        fetchOptions.next = {
          revalidate: cacheTime,
          tags: [...(tags || []), 'woocommerce'],
        };
      }

      const response = await fetchWithTimeout(url, fetchOptions, 20000);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));

        // Log authentication errors
        if (response.status === 401) {
          console.error('WooCommerce API 401 Unauthorized (Paginated):', {
            endpoint,
            url,
            errorData,
          });
        }

        throw parseWooCommerceError(response.status, errorData);
      }

      // Get pagination info from headers
      const total = parseInt(response.headers.get('x-wp-total') || '0', 10);
      const totalPages = parseInt(response.headers.get('x-wp-totalpages') || '1', 10);

      const data = await response.json();

      return {
        data: data as T[],
        total,
        totalPages,
        currentPage: params.page || 1,
        perPage: params.per_page || WC_API_CONFIG.defaults.perPage,
      };

    } catch (error) {
      if (error instanceof WooCommerceAPIError) {
        throw error;
      }

      // Handle timeout errors
      if (error instanceof Error && error.message.includes('timeout')) {
        throw new WooCommerceAPIError(
          0,
          `Request timeout: ${error.message}`,
          'timeout_error'
        );
      }

      throw new WooCommerceAPIError(
        500,
        error instanceof Error ? error.message : 'Failed to fetch paginated data',
        'pagination_error'
      );
    }
  }, 5, 2000); // Retry up to 5 times with 2s initial delay
}

/**
 * Create a new resource (POST request)
 */
export async function createWooCommerceResource<T>(
  endpoint: string,
  data: Record<string, any>
): Promise<T> {
  return fetchWooCommerceAPI<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update a resource (PUT request)
 */
export async function updateWooCommerceResource<T>(
  endpoint: string,
  data: Record<string, any>
): Promise<T> {
  return fetchWooCommerceAPI<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Partially update a resource (PATCH request)
 */
export async function patchWooCommerceResource<T>(
  endpoint: string,
  data: Record<string, any>
): Promise<T> {
  return fetchWooCommerceAPI<T>(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a resource (DELETE request)
 */
export async function deleteWooCommerceResource<T>(
  endpoint: string,
  force: boolean = false
): Promise<T> {
  const queryString = force ? '?force=true' : '';
  return fetchWooCommerceAPI<T>(`${endpoint}${queryString}`, {
    method: 'DELETE',
  });
}

/**
 * Batch operations
 * Allows creating, updating, and deleting multiple resources in a single request
 */
export async function batchWooCommerceResources<T>(
  endpoint: string,
  operations: {
    create?: Record<string, any>[];
    update?: Record<string, any>[];
    delete?: number[];
  }
): Promise<{
  create?: T[];
  update?: T[];
  delete?: T[];
}> {
  return fetchWooCommerceAPI<{
    create?: T[];
    update?: T[];
    delete?: T[];
  }>(`${endpoint}/batch`, {
    method: 'POST',
    body: JSON.stringify(operations),
  });
}

/**
 * Helper function to handle API errors gracefully
 * Returns null on error and logs the error
 */
export async function fetchWooCommerceSafe<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T | null> {
  try {
    return await fetchWooCommerceAPI<T>(endpoint, options);
  } catch (error) {
    if (error instanceof WooCommerceAPIError) {
      console.error(`WooCommerce API Error: ${error.message}`, {
        status: error.status,
        code: error.code,
        endpoint,
      });
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
}

/**
 * Check if WooCommerce API is accessible
 * Useful for health checks
 */
export async function checkWooCommerceConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  try {
    // Try to fetch system status or a simple endpoint
    await fetchWooCommerceAPI('/system_status');
    return {
      connected: true,
      message: 'Successfully connected to WooCommerce API',
    };
  } catch (error) {
    if (error instanceof WooCommerceAPIError) {
      return {
        connected: false,
        message: `WooCommerce API Error: ${error.message} (Status: ${error.status})`,
      };
    }
    return {
      connected: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
