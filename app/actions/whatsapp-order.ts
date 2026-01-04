/**
 * WhatsApp Order Server Action
 * Creates WooCommerce orders for WhatsApp ordering flow
 */

'use server';

import { createOrder, type CreateOrderData } from '@/lib/woocommerce/orders';
import type { Product, ProductVariation } from '@/types/woocommerce';
import type {
  WhatsAppCustomerData,
  WhatsAppShippingAddress,
  WhatsAppBillingAddress,
} from '@/types/whatsapp';
import { getWhatsAppPhone } from '@/lib/whatsapp/config';
import { generateWhatsAppUrl, detectDevice } from '@/lib/whatsapp/url-generator';
import {
  formatOrderMessage,
  formatAddress,
  formatPrice,
  formatVariation,
} from '@/lib/whatsapp/message-formatters';
import {
  validateCustomerData,
  validateShippingAddress,
} from '@/lib/whatsapp/validation';

export interface CreateWhatsAppOrderData {
  // Product context (for single product orders)
  product?: {
    id: number;
    name: string;
    slug: string;
    price: string;
    quantity: number;
    variation?: ProductVariation;
  };

  // Cart context (for cart orders)
  cart?: {
    items: Array<{
      productId: number;
      variationId?: number;
      quantity: number;
      name: string;
      price: string;
      variation?: string;
    }>;
    total: string;
    subtotal?: string;
    shipping?: string;
    tax?: string;
  };

  // Customer details (required)
  customer: WhatsAppCustomerData;

  // Shipping address (required)
  shipping: WhatsAppShippingAddress;

  // Billing address (optional, defaults to shipping)
  billing?: WhatsAppBillingAddress;

  // Order notes (optional)
  notes?: string;
}

export interface WhatsAppOrderResult {
  success: boolean;
  orderId?: number;
  orderNumber?: string;
  whatsappUrl?: string;
  error?: string;
}

/**
 * Creates a WooCommerce order and generates WhatsApp URL with order details
 * @param data - Order data including customer, shipping, and product/cart info
 * @returns WhatsApp order result with URL for redirect
 */
export async function createWhatsAppOrderAction(
  data: CreateWhatsAppOrderData
): Promise<WhatsAppOrderResult> {
  try {
    // Step 1: Validate customer data
    const customerValidation = validateCustomerData(data.customer);
    if (!customerValidation.valid) {
      return {
        success: false,
        error: `Customer validation failed: ${customerValidation.errors.join(', ')}`,
      };
    }

    // Step 2: Validate shipping address
    const shippingValidation = validateShippingAddress(data.shipping);
    if (!shippingValidation.valid) {
      return {
        success: false,
        error: `Shipping validation failed: ${shippingValidation.errors.join(', ')}`,
      };
    }

    // Step 3: Validate that either product or cart is provided
    if (!data.product && !data.cart) {
      return {
        success: false,
        error: 'Either product or cart items must be provided',
      };
    }

    // Step 4: Build line items for WooCommerce order
    const lineItems = data.product
      ? [
        {
          product_id: data.product.id,
          variation_id: data.product.variation?.id,
          quantity: data.product.quantity,
        },
      ]
      : data.cart!.items.map((item) => ({
        product_id: item.productId,
        variation_id: item.variationId,
        quantity: item.quantity,
      }));

    // Step 5: Build billing address (default to shipping if not provided)
    const billing = data.billing || {
      ...data.shipping,
      email: data.customer.email,
      phone: data.customer.phone,
      state: data.shipping.state || '',
    };

    // Step 6: Add customer names to addresses
    const shippingWithName = {
      ...data.shipping,
      first_name: data.customer.firstName,
      last_name: data.customer.lastName,
      phone: data.customer.phone,
      state: data.shipping.state || '',
    };

    const billingWithName = {
      ...billing,
      first_name: data.customer.firstName,
      last_name: data.customer.lastName,
      state: billing.state || '',
    };

    // Step 7: Create WooCommerce order
    const orderData: CreateOrderData = {
      billing: billingWithName,
      shipping: shippingWithName,
      line_items: lineItems,
      payment_method: 'whatsapp',
      payment_method_title: 'WhatsApp Order',
      customer_note: data.notes,
      set_paid: false, // Order starts as pending payment
    };

    const order = await createOrder(orderData);

    if (!order || !order.id) {
      return {
        success: false,
        error: 'Failed to create order in WooCommerce',
      };
    }

    // Step 8: Build WhatsApp message with order details
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const orderUrl = `${siteUrl}/my-account/orders/${order.id}`;

    // Format items for message
    const messageItems = data.product
      ? [
        {
          name: data.product.name,
          quantity: data.product.quantity,
          price: formatPrice(data.product.price, 'SEK'),
          variation: data.product.variation
            ? formatVariation(data.product.variation.attributes)
            : undefined,
        },
      ]
      : data.cart!.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        variation: item.variation,
      }));

    // Calculate totals
    const subtotal = data.cart?.subtotal || data.product!.price;
    const total = data.cart?.total || data.product!.price;
    const shipping = data.cart?.shipping;
    const tax = data.cart?.tax;

    const message = formatOrderMessage({
      orderId: order.id,
      orderNumber: order.number,
      orderUrl,
      items: messageItems,
      subtotal: formatPrice(subtotal, 'SEK'),
      shipping: shipping ? formatPrice(shipping, 'SEK') : undefined,
      tax: tax ? formatPrice(tax, 'SEK') : undefined,
      total: formatPrice(total, 'SEK'),
      shippingAddress: formatAddress(shippingWithName),
      billingAddress:
        billingWithName !== shippingWithName
          ? formatAddress(billingWithName)
          : undefined,
      paymentMethod: 'WhatsApp Order',
      orderNotes: data.notes,
    });

    // Step 8.5: Generate payment link for the order
    const paymentUrl = `${siteUrl}/checkout/order-pay/${order.id}?pay_for_order=true&key=${order.order_key}`;

    // Add payment information to message
    const enhancedMessage = `${message}

*💳 Payment Options:*

*Option 1: Pay Online Now*
Click here to pay securely with card:
${paymentUrl}

*Option 2: Pay on Delivery/Pickup*
You can also pay when you receive your order.

Please confirm your order and let us know your preferred payment method. Thank you!`;

    // Step 9: Generate WhatsApp URL
    const phone = getWhatsAppPhone('orders');
    const deviceType = detectDevice();
    const urlResult = generateWhatsAppUrl(phone, enhancedMessage, deviceType);

    // Step 10: Return success with WhatsApp URL
    return {
      success: true,
      orderId: order.id,
      orderNumber: order.number,
      whatsappUrl: urlResult.url,
    };
  } catch (error) {
    console.error('WhatsApp order creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Generates WhatsApp URL for product inquiry (without creating order)
 * Useful for simple product questions
 * @param product - Product to inquire about
 * @param quantity - Quantity of interest
 * @param customMessage - Optional custom message template
 * @returns WhatsApp URL or null if failed
 */
export async function createProductInquiryUrl(
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    variation?: ProductVariation;
  },
  quantity: number = 1,
  customMessage?: string
): Promise<string | null> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const productUrl = `${siteUrl}/product/${product.slug}`;

    // Import formatProductMessage dynamically to avoid circular deps
    const { formatProductMessage } = await import(
      '@/lib/whatsapp/message-formatters'
    );

    const message = formatProductMessage({
      productName: product.name,
      productUrl,
      price: formatPrice(product.price, 'SEK'),
      quantity,
      variation: product.variation
        ? formatVariation(product.variation.attributes)
        : undefined,
      customMessage,
    });

    const phone = getWhatsAppPhone('product');
    const deviceType = detectDevice();
    const urlResult = generateWhatsAppUrl(phone, message, deviceType);

    return urlResult.url;
  } catch (error) {
    console.error('Failed to create product inquiry URL:', error);
    return null;
  }
}
