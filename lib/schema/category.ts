/**
 * Category/CollectionPage Schema Generator
 * Framework-agnostic function for generating category/collection schemas
 */

import type { CollectionPage, CategoryInput, ProductInput } from './types';
import { generateSchemaId, sanitizeSchemaText, cleanSchema } from './base';
import { productListItem } from './product';

/**
 * Generate Category/CollectionPage Schema
 *
 * @param category - Category input data
 * @param options - Additional options
 * @returns Complete CollectionPage schema object
 */
export function categorySchema(
  category: CategoryInput,
  options?: {
    brandName?: string;
    sellerName?: string;
  }
): CollectionPage {
  const schema: CollectionPage = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${category.url}#collection`,
    name: category.name,
    url: category.url,
  };

  // Description
  const description = sanitizeSchemaText(category.description);
  if (description) {
    schema.description = description;
  }

  // Link to parent website
  if (category.websiteId) {
    schema.isPartOf = {
      '@id': category.websiteId,
    };
  }

  // Product list
  if (category.products && category.products.length > 0) {
    const items = category.products.map((product, index) =>
      productListItem(product, index + 1, {
        brandName: options?.brandName,
        sellerName: options?.sellerName,
      })
    );

    schema.mainEntity = {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items,
    };
  } else {
    // Empty category
    schema.mainEntity = {
      '@type': 'ItemList',
      numberOfItems: 0,
      itemListElement: [],
    };
  }

  return cleanSchema(schema);
}

/**
 * Generate WooCommerce Category Schema
 * Handles WooCommerce-specific category structure
 *
 * @param wooCategory - WooCommerce category object
 * @param wooProducts - Array of WooCommerce products in this category
 * @param options - Additional options
 * @returns Complete CollectionPage schema object
 */
export function wooCategorySchema(
  wooCategory: {
    id: number;
    name: string;
    slug: string;
    description?: string;
    count?: number;
    [key: string]: unknown;
  },
  wooProducts: Array<{
    id: number;
    name: string;
    slug: string;
    description?: string;
    short_description?: string;
    price?: string | number;
    regular_price?: string | number;
    sale_price?: string | number;
    sku?: string;
    images?: Array<{ src: string; alt?: string }>;
    categories?: Array<{ name: string }>;
    stock_status?: 'instock' | 'outofstock' | 'onbackorder';
    type?: 'simple' | 'variable' | 'grouped' | 'external';
    average_rating?: string | number;
    rating_count?: number;
    low_price?: string | number;
    high_price?: string | number;
    [key: string]: unknown;
  }>,
  options: {
    baseUrl: string;
    brandName?: string;
    sellerName?: string;
    websiteId?: string;
  }
): CollectionPage {
  // Build category URL
  const categoryUrl = `${options.baseUrl}/product-category/${wooCategory.slug}`;

  // Convert WooCommerce products to ProductInput
  const products: ProductInput[] = wooProducts.map((wooProduct) => {
    let availability: 'InStock' | 'OutOfStock' | 'BackOrder' = 'InStock';
    if (wooProduct.stock_status === 'outofstock') {
      availability = 'OutOfStock';
    } else if (wooProduct.stock_status === 'onbackorder') {
      availability = 'BackOrder';
    }

    const isVariable = wooProduct.type === 'variable';

    return {
      name: wooProduct.name,
      description: wooProduct.description,
      shortDescription: wooProduct.short_description,
      sku: wooProduct.sku,
      price: wooProduct.price,
      regularPrice: wooProduct.regular_price,
      salePrice: wooProduct.sale_price,
      currency: 'SEK',
      availability,
      url: `${options.baseUrl}/product/${wooProduct.slug}`,
      images: wooProduct.images,
      category: wooCategory.name,
      rating: wooProduct.average_rating ? Number(wooProduct.average_rating) : undefined,
      reviewCount: wooProduct.rating_count,
      isVariable,
      lowPrice: isVariable ? wooProduct.low_price : undefined,
      highPrice: isVariable ? wooProduct.high_price : undefined,
    };
  });

  return categorySchema(
    {
      name: wooCategory.name,
      description: wooCategory.description,
      url: categoryUrl,
      products,
      websiteId: options.websiteId,
    },
    {
      brandName: options.brandName || 'Ideal Indiska LIVS',
      sellerName: options.sellerName || 'Ideal Indiska LIVS',
    }
  );
}
