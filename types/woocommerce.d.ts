/**
 * WooCommerce REST API v3 Type Definitions
 *
 * Complete TypeScript type definitions for WooCommerce REST API responses.
 * Based on WooCommerce REST API v3 documentation.
 */

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  type: ProductType;
  status: ProductStatus;
  featured: boolean;
  catalog_visibility: CatalogVisibility;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_from_gmt: string | null;
  date_on_sale_to: string | null;
  date_on_sale_to_gmt: string | null;
  on_sale: boolean;
  purchasable: boolean;
  total_sales: number;
  virtual: boolean;
  downloadable: boolean;
  downloads: ProductDownload[];
  download_limit: number;
  download_expiry: number;
  external_url: string;
  button_text: string;
  tax_status: TaxStatus;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: StockStatus;
  backorders: BackorderStatus;
  backorders_allowed: boolean;
  backordered: boolean;
  low_stock_amount: number | null;
  sold_individually: boolean;
  weight: string;
  dimensions: ProductDimensions;
  shipping_required: boolean;
  shipping_taxable: boolean;
  shipping_class: string;
  shipping_class_id: number;
  reviews_allowed: boolean;
  average_rating: string;
  rating_count: number;
  upsell_ids: number[];
  cross_sell_ids: number[];
  parent_id: number;
  purchase_note: string;
  categories: ProductCategory[];
  tags: ProductTag[];
  images: ProductImage[];
  attributes: ProductAttribute[];
  default_attributes: ProductDefaultAttribute[];
  variations: number[];
  grouped_products: number[];
  menu_order: number;
  price_html: string;
  related_ids: number[];
  meta_data: MetaData[];
  brands?: Brand[];
  _links?: HATEOASLinks;
  [key: string]: unknown;
}

export interface Brand {
  id: number;
  name: string;
  slug: string;
  image?: { // Assuming image might be present based on guide
    id: number;
    src: string;
    alt: string;
  } | string; // Sometimes it's just a URL string in some plugins
}

export type ProductType = 'simple' | 'grouped' | 'external' | 'variable';
export type ProductStatus = 'draft' | 'pending' | 'private' | 'publish';
export type CatalogVisibility = 'visible' | 'catalog' | 'search' | 'hidden';
export type TaxStatus = 'taxable' | 'shipping' | 'none';
export type StockStatus = 'instock' | 'outofstock' | 'onbackorder';
export type BackorderStatus = 'no' | 'notify' | 'yes';

export interface ProductDownload {
  id: string;
  name: string;
  file: string;
}

export interface ProductDimensions {
  length: string;
  width: string;
  height: string;
}

export interface ProductImage {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  src: string;
  name: string;
  alt: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ProductTag {
  id: number;
  name: string;
  slug: string;
}

export interface ProductAttribute {
  id: number;
  name: string;
  position: number;
  visible: boolean;
  variation: boolean;
  options: string[];
}

export interface ProductDefaultAttribute {
  id: number;
  name: string;
  option: string;
}

// ============================================================================
// PRODUCT VARIATION TYPES
// ============================================================================

export interface ProductVariation {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  description: string;
  permalink: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  date_on_sale_from: string | null;
  date_on_sale_from_gmt: string | null;
  date_on_sale_to: string | null;
  date_on_sale_to_gmt: string | null;
  on_sale: boolean;
  status: ProductStatus;
  purchasable: boolean;
  virtual: boolean;
  downloadable: boolean;
  downloads: ProductDownload[];
  download_limit: number;
  download_expiry: number;
  tax_status: TaxStatus;
  tax_class: string;
  manage_stock: boolean;
  stock_quantity: number | null;
  stock_status: StockStatus;
  backorders: BackorderStatus;
  backorders_allowed: boolean;
  backordered: boolean;
  low_stock_amount: number | null;
  weight: string;
  dimensions: ProductDimensions;
  shipping_class: string;
  shipping_class_id: number;
  image: ProductImage;
  attributes: VariationAttribute[];
  menu_order: number;
  meta_data: MetaData[];
  _links?: HATEOASLinks;
}

export interface VariationAttribute {
  id: number;
  name: string;
  option: string;
}

// ============================================================================
// CATEGORY TYPES
// ============================================================================

export interface ProductCategoryFull extends ProductCategory {
  parent: number;
  description: string;
  display: CategoryDisplay;
  image: CategoryImage | null;
  menu_order: number;
  count: number;
  _links?: HATEOASLinks;
  [key: string]: unknown;
}

export type CategoryDisplay = 'default' | 'products' | 'subcategories' | 'both';

export interface CategoryImage {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  src: string;
  name: string;
  alt: string;
}

// ============================================================================
// TAG TYPES
// ============================================================================

export interface ProductTagFull extends ProductTag {
  description: string;
  count: number;
  _links?: HATEOASLinks;
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface ProductReview {
  id: number;
  date_created: string;
  date_created_gmt: string;
  product_id: number;
  product_name: string;
  product_permalink: string;
  status: ReviewStatus;
  reviewer: string;
  reviewer_email: string;
  review: string;
  rating: number;
  verified: boolean;
  reviewer_avatar_urls: AvatarUrls;
  _links?: HATEOASLinks;
}

export type ReviewStatus = 'approved' | 'hold' | 'spam' | 'unspam' | 'trash' | 'untrash';

export interface AvatarUrls {
  24: string;
  48: string;
  96: string;
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export interface Order {
  id: number;
  parent_id: number;
  status: OrderStatus;
  currency: string;
  version: string;
  prices_include_tax: boolean;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  discount_total: string;
  discount_tax: string;
  shipping_total: string;
  shipping_tax: string;
  cart_tax: string;
  total: string;
  total_tax: string;
  customer_id: number;
  order_key: string;
  billing: BillingAddress;
  shipping: ShippingAddress;
  payment_method: string;
  payment_method_title: string;
  transaction_id: string;
  customer_ip_address: string;
  customer_user_agent: string;
  created_via: string;
  customer_note: string;
  date_completed: string | null;
  date_completed_gmt: string | null;
  date_paid: string | null;
  date_paid_gmt: string | null;
  cart_hash: string;
  number: string;
  meta_data: MetaData[];
  line_items: LineItem[];
  tax_lines: TaxLine[];
  shipping_lines: ShippingLine[];
  fee_lines: FeeLine[];
  coupon_lines: CouponLine[];
  refunds: Refund[];
  payment_url: string;
  is_editable: boolean;
  needs_payment: boolean;
  needs_processing: boolean;
  date_created_format: string;
  date_modified_format: string;
  _links?: HATEOASLinks;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'on-hold'
  | 'completed'
  | 'cancelled'
  | 'refunded'
  | 'failed'
  | 'trash';

export interface BillingAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  company?: string;
  address_1: string;
  address_2?: string;
  city: string;
  state?: string;
  postcode: string;
  country: string;
  phone?: string;
}

export interface LineItem {
  id: number;
  name: string;
  product_id: number;
  variation_id: number;
  quantity: number;
  tax_class: string;
  subtotal: string;
  subtotal_tax: string;
  total: string;
  total_tax: string;
  taxes: Tax[];
  meta_data: MetaData[];
  sku: string;
  price: number;
  image: ProductImage;
  parent_name: string | null;
}

export interface TaxLine {
  id: number;
  rate_code: string;
  rate_id: number;
  label: string;
  compound: boolean;
  tax_total: string;
  shipping_tax_total: string;
  rate_percent: number;
  meta_data: MetaData[];
}

export interface ShippingLine {
  id: number;
  method_title: string;
  method_id: string;
  instance_id: string;
  total: string;
  total_tax: string;
  taxes: Tax[];
  meta_data: MetaData[];
}

export interface FeeLine {
  id: number;
  name: string;
  tax_class: string;
  tax_status: TaxStatus;
  amount: string;
  total: string;
  total_tax: string;
  taxes: Tax[];
  meta_data: MetaData[];
}

export interface CouponLine {
  id: number;
  code: string;
  discount: string;
  discount_tax: string;
  meta_data: MetaData[];
}

export interface Refund {
  id: number;
  reason: string;
  total: string;
}

export interface Tax {
  id: number;
  total: string;
  subtotal: string;
}

// ============================================================================
// CUSTOMER TYPES
// ============================================================================

export interface Customer {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  username: string;
  billing: BillingAddress;
  shipping: ShippingAddress;
  is_paying_customer: boolean;
  avatar_url: string;
  meta_data: MetaData[];
  _links?: HATEOASLinks;
}

// ============================================================================
// COUPON TYPES
// ============================================================================

export interface Coupon {
  id: number;
  code: string;
  amount: string;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  discount_type: DiscountType;
  description: string;
  date_expires: string | null;
  date_expires_gmt: string | null;
  usage_count: number;
  individual_use: boolean;
  product_ids: number[];
  excluded_product_ids: number[];
  usage_limit: number | null;
  usage_limit_per_user: number | null;
  limit_usage_to_x_items: number | null;
  free_shipping: boolean;
  product_categories: number[];
  excluded_product_categories: number[];
  exclude_sale_items: boolean;
  minimum_amount: string;
  maximum_amount: string;
  email_restrictions: string[];
  used_by: string[];
  meta_data: MetaData[];
  _links?: HATEOASLinks;
}

export type DiscountType = 'percent' | 'fixed_cart' | 'fixed_product';

// ============================================================================
// PAYMENT GATEWAY TYPES
// ============================================================================

export interface PaymentGateway {
  id: string;
  title: string;
  description: string;
  order: number;
  enabled: boolean;
  method_title: string;
  method_description: string;
  method_supports: string[];
  settings: PaymentGatewaySettings;
  _links?: HATEOASLinks;
}

export interface PaymentGatewaySettings {
  [key: string]: PaymentGatewaySetting;
}

export interface PaymentGatewaySetting {
  id: string;
  label: string;
  description: string;
  type: string;
  value: string;
  default: string;
  tip: string;
  placeholder: string;
}

// ============================================================================
// SHIPPING TYPES
// ============================================================================

export interface ShippingZone {
  id: number;
  name: string;
  order: number;
  _links?: HATEOASLinks;
}

export interface ShippingMethod {
  id: string;
  title: string;
  description: string;
  _links?: HATEOASLinks;
}

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface MetaData {
  id: number;
  key: string;
  value: string | number | boolean | object;
}

export interface HATEOASLinks {
  self: HATEOASLink[];
  collection: HATEOASLink[];
  [key: string]: HATEOASLink[];
}

export interface HATEOASLink {
  href: string;
}

// ============================================================================
// QUERY PARAMETER TYPES
// ============================================================================

export interface ProductQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  after?: string;
  before?: string;
  exclude?: number[];
  include?: number[];
  offset?: number;
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'id' | 'include' | 'title' | 'slug' | 'price' | 'popularity' | 'rating';
  parent?: number[];
  parent_exclude?: number[];
  slug?: string;
  status?: ProductStatus;
  type?: ProductType;
  sku?: string;
  featured?: boolean;
  category?: string;
  tag?: string;
  shipping_class?: string;
  attribute?: string;
  attribute_term?: string;
  tax_class?: string;
  on_sale?: boolean;
  min_price?: string;
  max_price?: string;
  stock_status?: StockStatus;
  product_brand?: string;
  brand?: string;
}

export interface CategoryQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  exclude?: number[];
  include?: number[];
  order?: 'asc' | 'desc';
  orderby?: 'id' | 'include' | 'name' | 'slug' | 'term_group' | 'description' | 'count' | 'menu_order';
  hide_empty?: boolean;
  parent?: number;
  product?: number;
  slug?: string;
}

export interface OrderQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  after?: string;
  before?: string;
  exclude?: number[];
  include?: number[];
  offset?: number;
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'id' | 'include' | 'title' | 'slug';
  parent?: number[];
  parent_exclude?: number[];
  status?: OrderStatus | OrderStatus[];
  customer?: number;
  product?: number;
  dp?: number;
}

export interface CustomerQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  exclude?: number[];
  include?: number[];
  offset?: number;
  order?: 'asc' | 'desc';
  orderby?: 'id' | 'include' | 'name' | 'registered_date';
  email?: string;
  role?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface WooCommerceAPIResponse<T> {
  data: T;
  headers: {
    'x-wp-total': string;
    'x-wp-totalpages': string;
  };
}

export interface WooCommercePaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export interface WooCommerceError {
  code: string;
  message: string;
  data: {
    status: number;
    params?: Record<string, string>;
    details?: Record<string, any>;
  };
}

// ============================================================================
// CART TYPES (For Frontend State Management)
// ============================================================================

export interface CartItem {
  key: string;
  productId: number;
  variationId?: number;
  quantity: number;
  price: string;
  product: Product;
  variation?: ProductVariation;
  total: string;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: string;
  tax: string;
  shipping: string;
  total: string;
  coupons: CouponLine[];
  needsShipping: boolean;
}
