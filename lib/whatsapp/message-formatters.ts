/**
 * WhatsApp Message Formatters
 * Formats messages for different contexts (product, cart, order)
 */

import type {
  WhatsAppProductMessage,
  WhatsAppCartMessage,
  WhatsAppOrderMessage,
} from '@/types/whatsapp';

/**
 * Formats a product inquiry message for WhatsApp
 * Supports custom message templates with variable interpolation
 * @param data - Product message data
 * @returns Formatted WhatsApp message
 */
export function formatProductMessage(data: WhatsAppProductMessage): string {
  // If custom message is provided, use it with interpolation
  if (data.customMessage) {
    return interpolateCustomMessage(data.customMessage, data);
  }

  // Default product message format
  const parts: string[] = [
    '*Product Inquiry*',
    '',
    `*${data.productName}*`,
  ];

  // Add variation details if available
  if (data.variation) {
    parts.push(`Variant: ${data.variation}`);
  }

  parts.push(
    `*Price:* ${data.price}`,
    `*Quantity:* ${data.quantity}`,
    '',
    `Product Link: ${data.productUrl}`,
    '',
    'I would like to order this product.'
  );

  return parts.join('\n').trim();
}

/**
 * Formats a cart order request message for WhatsApp
 * @param data - Cart message data
 * @returns Formatted WhatsApp message
 */
export function formatCartMessage(data: WhatsAppCartMessage): string {
  const parts: string[] = ['*Order Request*', ''];

  // Add items list
  parts.push('*Items:*');
  data.items.forEach((item, index) => {
    parts.push(`${index + 1}. *${item.name}*${item.variation ? ` (${item.variation})` : ''}`);
    parts.push(`   Quantity: ${item.quantity}`);
    parts.push(`   Price: ${item.price}`);
    if (index < data.items.length - 1) {
      parts.push(''); // Empty line between items
    }
  });

  // Add summary
  parts.push('');
  parts.push(`*Subtotal:* ${data.subtotal}`);

  if (data.shipping) {
    parts.push(`*Shipping:* ${data.shipping}`);
  }

  if (data.tax) {
    parts.push(`*Tax:* ${data.tax}`);
  }

  parts.push(`*Total:* ${data.total}`);

  // Add customer details if available
  if (data.customerName || data.customerPhone) {
    parts.push('');
    if (data.customerName) {
      parts.push(`Customer: ${data.customerName}`);
    }
    if (data.customerPhone) {
      parts.push(`Phone: ${data.customerPhone}`);
    }
  }

  parts.push('');
  parts.push('I would like to complete this order.');

  return parts.join('\n').trim();
}

/**
 * Formats an order confirmation message for WhatsApp
 * Includes full order details for record-keeping
 * @param data - Order message data
 * @returns Formatted WhatsApp message
 */
export function formatOrderMessage(data: WhatsAppOrderMessage): string {
  const parts: string[] = [
    `*Order Confirmation #${data.orderNumber}*`,
    '',
  ];

  // Add items list
  parts.push('*Items:*');
  data.items.forEach((item, index) => {
    parts.push(`${index + 1}. *${item.name}*${item.variation ? ` (${item.variation})` : ''}`);
    parts.push(`   Quantity: ${item.quantity}`);
    parts.push(`   Price: ${item.price}`);
    if (index < data.items.length - 1) {
      parts.push(''); // Empty line between items
    }
  });

  // Add order summary
  parts.push('');
  parts.push('*Summary:*');
  parts.push(`Subtotal: ${data.subtotal}`);

  if (data.shipping) {
    parts.push(`Shipping: ${data.shipping}`);
  }

  if (data.tax) {
    parts.push(`Tax: ${data.tax}`);
  }

  parts.push(`*Total:* ${data.total}`);

  // Add shipping address
  parts.push('');
  parts.push('*Shipping Address:*');
  parts.push(data.shippingAddress);

  // Add billing address if different from shipping
  if (data.billingAddress && data.billingAddress !== data.shippingAddress) {
    parts.push('');
    parts.push('*Billing Address:*');
    parts.push(data.billingAddress);
  }

  // Add payment method
  parts.push('');
  parts.push(`*Payment Method:* ${data.paymentMethod}`);

  // Add order notes if present
  if (data.orderNotes) {
    parts.push('');
    parts.push(`*Notes:* ${data.orderNotes}`);
  }

  // Add order link and ID
  parts.push('');
  parts.push(`Order Details: ${data.orderUrl}`);
  parts.push('');
  parts.push(`Order ID: ${data.orderId}`);

  return parts.join('\n').trim();
}

/**
 * Interpolates variables in a custom message template
 * Supports: {productName}, {price}, {quantity}, {variation}, {url}
 * @param template - Message template with placeholders
 * @param data - Product data for interpolation
 * @returns Interpolated message
 */
function interpolateCustomMessage(
  template: string,
  data: WhatsAppProductMessage
): string {
  return template
    .replace(/\{productName\}/g, data.productName)
    .replace(/\{price\}/g, data.price)
    .replace(/\{quantity\}/g, String(data.quantity))
    .replace(/\{variation\}/g, data.variation || '')
    .replace(/\{url\}/g, data.productUrl);
}

/**
 * Formats an address object into a readable string
 * @param address - Address object with address lines, city, state, postcode, country
 * @returns Formatted address string
 */
export function formatAddress(address: {
  first_name?: string;
  last_name?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state?: string;
  postcode: string;
  country: string;
}): string {
  const parts: string[] = [];

  if (address.first_name && address.last_name) {
    parts.push(`${address.first_name} ${address.last_name}`);
  }

  parts.push(address.address_1);

  if (address.address_2) {
    parts.push(address.address_2);
  }

  const cityLine = address.state
    ? `${address.city}, ${address.state} ${address.postcode}`
    : `${address.city} ${address.postcode}`;

  parts.push(cityLine);
  parts.push(address.country);

  return parts.join('\n');
}

/**
 * Formats a price with currency
 * @param price - Price value (number or string)
 * @param currency - Currency code (default: SEK)
 * @returns Formatted price string
 */
export function formatPrice(price: number | string | null | undefined, currency: string = 'SEK'): string {
  // Handle null/undefined/empty values
  if (price === null || price === undefined || price === '') {
    return `0 ${currency}`;
  }

  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numericPrice)) {
    return `${price}`;
  }

  // Format based on currency
  if (currency === 'SEK' || currency === 'kr') {
    return `${numericPrice.toFixed(2)} kr`;
  }

  // Default format
  return `${currency} ${numericPrice.toFixed(2)}`;
}

/**
 * Formats product variation attributes into a readable string
 * @param attributes - Array of variation attributes
 * @returns Formatted variation string
 */
export function formatVariation(
  attributes: Array<{ name: string; option: string }>
): string {
  if (!attributes || attributes.length === 0) {
    return '';
  }

  return attributes.map((attr) => attr.option).join(', ');
}
