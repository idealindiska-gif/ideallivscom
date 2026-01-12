/**
 * WooCommerce REST API Configuration
 *
 * This file contains all configuration settings for the WooCommerce REST API v3 integration.
 * It handles API URLs, authentication, endpoints, and caching strategies.
 */

// WooCommerce API Base Configuration
export const WC_API_CONFIG = {
  // API Base URL (will be constructed from environment variables)
  baseUrl: `${process.env.NEXT_PUBLIC_WORDPRESS_URL}/wp-json/wc/v3`,

  // Authentication credentials (server-side only)
  auth: {
    consumerKey: process.env.WORDPRESS_CONSUMER_KEY || '',
    consumerSecret: process.env.WORDPRESS_CONSUMER_SECRET || '',
  },

  // WooCommerce REST API v3 Endpoints
  endpoints: {
    // Products
    products: '/products',
    productById: (id: number) => `/products/${id}`,
    productBySlug: (slug: string) => `/products?slug=${slug}`,
    productVariations: (productId: number) => `/products/${productId}/variations`,
    productVariationById: (productId: number, variationId: number) =>
      `/products/${productId}/variations/${variationId}`,
    productReviews: '/products/reviews',
    productReviewsByProduct: (productId: number) => `/products/reviews?product=${productId}`,

    // Product Categories
    productCategories: '/products/categories',
    productCategoryById: (id: number) => `/products/categories/${id}`,
    productCategoryBySlug: (slug: string) => `/products/categories?slug=${slug}`,

    // Product Tags
    productTags: '/products/tags',
    productTagById: (id: number) => `/products/tags/${id}`,
    productTagBySlug: (slug: string) => `/products/tags?slug=${slug}`,

    // Product Attributes
    productAttributes: '/products/attributes',
    productAttributeById: (id: number) => `/products/attributes/${id}`,
    productAttributeTerms: (attributeId: number) => `/products/attributes/${attributeId}/terms`,

    // Orders
    orders: '/orders',
    orderById: (id: number) => `/orders/${id}`,

    // Customers
    customers: '/customers',
    customerById: (id: number) => `/customers/${id}`,
    customerByEmail: (email: string) => `/customers?email=${email}`,

    // Coupons
    coupons: '/coupons',
    couponById: (id: number) => `/coupons/${id}`,
    couponByCode: (code: string) => `/coupons?code=${code}`,

    // Payment Gateways
    paymentGateways: '/payment_gateways',
    paymentGatewayById: (id: string) => `/payment_gateways/${id}`,

    // Shipping
    shippingZones: '/shipping/zones',
    shippingZoneById: (id: number) => `/shipping/zones/${id}`,
    shippingMethods: '/shipping_methods',

    // Tax
    taxRates: '/taxes',
    taxClasses: '/taxes/classes',

    // Settings
    settings: '/settings',
    settingsByGroup: (group: string) => `/settings/${group}`,
  },

  // Cache configuration (in seconds)
  // Optimized for Vercel cost reduction - prices rarely change
  cache: {
    // Product caching - aggressive since prices rarely change
    products: 7200, // 2 hours (was 30 min)
    productDetail: 7200, // 2 hours (was 1 hour)
    productVariations: 7200, // 2 hours (was 30 min)

    // Category/Tag caching - very stable data
    categories: 86400, // 24 hours (was 1 hour)
    tags: 86400, // 24 hours (was 1 hour)

    // No cache for user-specific data
    cart: 0,
    orders: 0,
    customers: 0,

    // Settings cache - rarely changes
    settings: 604800, // 7 days (was 24 hours)
    paymentGateways: 604800, // 7 days
    shippingMethods: 604800, // 7 days
  },

  // Default query parameters
  defaults: {
    perPage: 20,
    orderBy: 'date',
    order: 'desc',
  },

  // Pagination limits
  limits: {
    maxPerPage: 100,
    defaultPerPage: 20,
  },
} as const;

/**
 * Get the full API URL for a given endpoint
 */
export function getWooCommerceUrl(endpoint: string): string {
  return `${WC_API_CONFIG.baseUrl}${endpoint}`;
}

/**
 * Generate Basic Auth header for WooCommerce API
 * Uses Base64 encoding of consumer_key:consumer_secret
 */
export function getWooCommerceAuthHeader(): string {
  // Read environment variables directly to ensure they're available at runtime
  const consumerKey = process.env.WORDPRESS_CONSUMER_KEY;
  const consumerSecret = process.env.WORDPRESS_CONSUMER_SECRET;

  if (!consumerKey || !consumerSecret) {
    console.error('Missing WC credentials:', {
      hasKey: !!consumerKey,
      hasSecret: !!consumerSecret,
      nodeEnv: process.env.NODE_ENV
    });
    throw new Error(
      'WooCommerce API credentials are not configured. Please set WORDPRESS_CONSUMER_KEY and WORDPRESS_CONSUMER_SECRET environment variables.'
    );
  }

  // Create base64 encoded string of key:secret
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  return `Basic ${credentials}`;
}

/**
 * Build query string from parameters
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      // Handle arrays
      if (Array.isArray(value)) {
        value.forEach((item) => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Validate WooCommerce configuration
 */
export function validateWooCommerceConfig(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!process.env.NEXT_PUBLIC_WORDPRESS_URL) {
    errors.push('NEXT_PUBLIC_WORDPRESS_URL is not set');
  }

  if (!process.env.WORDPRESS_CONSUMER_KEY) {
    errors.push('WORDPRESS_CONSUMER_KEY is not set');
  }

  if (!process.env.WORDPRESS_CONSUMER_SECRET) {
    errors.push('WORDPRESS_CONSUMER_SECRET is not set');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
