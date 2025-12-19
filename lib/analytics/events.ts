/**
 * Analytics Event Tracking
 * Functions for tracking e-commerce events with GTM and Facebook Pixel
 */

import type { Product } from '@/types/woocommerce';

/**
 * Declare GTM dataLayer on window object
 */
declare global {
  interface Window {
    dataLayer: any[];
    fbq: any;
  }
}

/**
 * Track product view event
 */
export function trackViewContent(product: Product) {
  // Google Tag Manager
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'view_item',
      ecommerce: {
        currency: 'SEK',
        value: parseFloat(product.price || '0'),
        items: [
          {
            item_id: product.id.toString(),
            item_name: product.name,
            item_brand: product.brands?.[0]?.name || 'Ideal Indiska LIVS',
            item_category: product.categories?.[0]?.name || '',
            price: parseFloat(product.price || '0'),
            quantity: 1,
          },
        ],
      },
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: parseFloat(product.price || '0'),
      currency: 'SEK',
    });
  }
}

/**
 * Track add to cart event
 */
export function trackAddToCart(product: Product, quantity: number = 1, variationId?: number) {
  const price = parseFloat(product.price || '0');
  const value = price * quantity;

  // Google Tag Manager
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'add_to_cart',
      ecommerce: {
        currency: 'SEK',
        value: value,
        items: [
          {
            item_id: product.id.toString(),
            item_name: product.name,
            item_brand: product.brands?.[0]?.name || 'Ideal Indiska LIVS',
            item_category: product.categories?.[0]?.name || '',
            item_variant: variationId?.toString(),
            price: price,
            quantity: quantity,
          },
        ],
      },
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [product.id],
      content_name: product.name,
      content_type: 'product',
      value: value,
      currency: 'SEK',
    });
  }
}

/**
 * Track initiate checkout event
 */
export function trackInitiateCheckout(items: any[], totalValue: number) {
  // Google Tag Manager
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'begin_checkout',
      ecommerce: {
        currency: 'SEK',
        value: totalValue,
        items: items.map((item) => ({
          item_id: item.productId?.toString(),
          item_name: item.product?.name || '',
          item_brand: item.product?.brands?.[0]?.name || 'Ideal Indiska LIVS',
          item_category: item.product?.categories?.[0]?.name || '',
          item_variant: item.variationId?.toString(),
          price: parseFloat(item.product?.price || '0'),
          quantity: item.quantity || 1,
        })),
      },
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    const contentIds = items.map((item) => item.productId);
    window.fbq('track', 'InitiateCheckout', {
      content_ids: contentIds,
      content_type: 'product',
      value: totalValue,
      currency: 'SEK',
      num_items: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
    });
  }
}

/**
 * Track purchase event
 */
export function trackPurchase(
  orderId: string | number,
  totalValue: number,
  items: any[],
  shippingCost: number = 0,
  tax: number = 0
) {
  // Google Tag Manager
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'purchase',
      ecommerce: {
        transaction_id: orderId.toString(),
        currency: 'SEK',
        value: totalValue,
        shipping: shippingCost,
        tax: tax,
        items: items.map((item: any) => ({
          item_id: item.product_id?.toString() || item.id?.toString(),
          item_name: item.name || '',
          price: parseFloat(item.price || item.total || '0'),
          quantity: item.quantity || 1,
        })),
      },
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    const contentIds = items.map((item: any) => item.product_id || item.id);
    window.fbq('track', 'Purchase', {
      content_ids: contentIds,
      content_type: 'product',
      value: totalValue,
      currency: 'SEK',
      num_items: items.reduce(
        (sum: number, item: any) => sum + (item.quantity || 1),
        0
      ),
    });
  }
}

/**
 * Track category/collection view event
 */
export function trackViewCategory(
  categoryName: string,
  categoryId: string | number,
  itemCount: number = 0
) {
  // Google Tag Manager
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'view_item_list',
      ecommerce: {
        item_list_id: categoryId.toString(),
        item_list_name: categoryName,
      },
    });
  }

  // Facebook Pixel - ViewContent for category pages
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: categoryName,
      content_category: categoryName,
      content_type: 'product_group',
    });
  }
}

/**
 * Track search event
 */
export function trackSearch(searchQuery: string, resultCount: number = 0) {
  // Google Tag Manager
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'search',
      search_term: searchQuery,
      search_results: resultCount,
    });
  }

  // Facebook Pixel
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Search', {
      search_string: searchQuery,
    });
  }
}
