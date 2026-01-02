/**
 * WhatsApp Integration Types
 * Type definitions for WhatsApp ordering functionality
 */

export interface WhatsAppConfig {
  phone: string;
  businessName: string;
  contextPhones?: {
    product?: string;
    orders?: string;
    support?: string;
  };
}

export type WhatsAppMessageContext = 'product' | 'cart' | 'checkout' | 'orders';

export type DeviceType = 'mobile' | 'desktop';

export interface WhatsAppProductMessage {
  productName: string;
  productUrl: string;
  price: string;
  quantity: number;
  variation?: string;
  customMessage?: string;
}

export interface WhatsAppCartMessage {
  items: Array<{
    name: string;
    quantity: number;
    price: string;
    variation?: string;
  }>;
  subtotal: string;
  shipping?: string;
  tax?: string;
  total: string;
  customerName?: string;
  customerPhone?: string;
}

export interface WhatsAppOrderMessage extends WhatsAppCartMessage {
  orderId: number;
  orderNumber: string;
  orderUrl: string;
  shippingAddress: string;
  billingAddress?: string;
  paymentMethod: string;
  orderNotes?: string;
}

export interface WhatsAppUrlResult {
  url: string;
  message: string;
  deviceType: DeviceType;
}

// Customer data interfaces
export interface WhatsAppCustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface WhatsAppShippingAddress {
  address_1: string;
  address_2?: string;
  city: string;
  state?: string;
  postcode: string;
  country: string;
}

export interface WhatsAppBillingAddress extends WhatsAppShippingAddress {
  email: string;
  phone: string;
}

// Validation result interface
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
