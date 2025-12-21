/**
 * WooCommerce Direct API Product Operations
 *
 * Direct WooCommerce REST API integration (bypassing Fourlines MCP)
 */

import {
  fetchWooCommerceAPI,
  fetchWooCommerceCached,
  fetchWooCommercePaginated,
} from './api';
import { WC_API_CONFIG } from './config';
import type {
  Product,
  ProductVariation,
  ProductCategoryFull,
  ProductTagFull,
  ProductReview,
  ProductQueryParams,
  CategoryQueryParams,
} from '@/types/woocommerce';

// ============================================================================
// PRODUCT FETCHING
// ============================================================================

/**
 * Get all products with optional filters and pagination
 */
export async function getProducts(params: ProductQueryParams = {}): Promise<{
  data: Product[];
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}> {
  // Store converted category IDs for fallback use (declare outside try/catch)
  let convertedCategoryIds: string | undefined;

  try {
    // Build query params - only include defined values
    const queryParams: Record<string, any> = {
      per_page: params.per_page || 20,
      page: params.page || 1,
      orderby: params.orderby || 'date',
      order: params.order || 'desc',
      status: params.status || 'publish', // Default to published products only
    };

    // Handle category parameter - convert slugs to IDs if needed
    if (params.category) {
      const categoryParam = params.category;
      // Check if it's a comma-separated list of slugs
      const categoryValues = categoryParam.split(',');

      // Check if first value is numeric (ID) or slug
      if (isNaN(Number(categoryValues[0]))) {
        // It's slugs, need to convert to IDs
        const allCategories = await getProductCategories();
        const categoryIds = categoryValues
          .map(slug => {
            const cat = allCategories.find(c => c.slug === slug.trim());
            return cat?.id;
          })
          .filter((id): id is number => id !== undefined);

        if (categoryIds.length > 0) {
          convertedCategoryIds = categoryIds.join(',');
          queryParams.category = convertedCategoryIds;
        }
      } else {
        // Already IDs, use as-is
        convertedCategoryIds = categoryParam;
        queryParams.category = categoryParam;
      }
    }

    // Only add optional params if they're explicitly set
    if (params.search) queryParams.search = params.search;
    if (params.tag) queryParams.tag = params.tag;
    if (params.featured !== undefined) queryParams.featured = params.featured;
    if (params.on_sale !== undefined) queryParams.on_sale = params.on_sale;
    if (params.min_price) queryParams.min_price = params.min_price;
    if (params.max_price) queryParams.max_price = params.max_price;
    if (params.stock_status) queryParams.stock_status = params.stock_status;
    if (params.brand) queryParams.brand = params.brand;

    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 Fetching products with params:', queryParams);
    }

    const response = await fetchWooCommercePaginated<Product>(
      WC_API_CONFIG.endpoints.products,
      queryParams,
      WC_API_CONFIG.cache.products,
      ['products']
    );

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Fetched ${response.data.length} products from WooCommerce (Total: ${response.total})`);
    }

    return {
      data: response.data,
      total: response.total,
      totalPages: response.totalPages,
      currentPage: response.currentPage,
      perPage: response.perPage,
    };
  } catch (error: any) {
    // General Fallback for 403 Forbidden (Search, Categories, or Pagination)
    if (error?.status === 403) {
      // Prevent infinite loop: if we are already in fallback mode (fetching all), stop
      if (params.per_page === 100 && params.page === 1 && !params.search && !params.category) {
        console.error('Fallback fetch also failed (403)');

        // For local development: return mock data instead of empty results
        // This allows development to continue while Vercel Security Checkpoint blocks local requests
        // In production (Vercel), this won't be triggered as Vercel-to-Vercel requests are allowed
        if (process.env.NODE_ENV === 'development') {
          console.warn('🔧 Development Mode: Using mock product data (API blocked by Vercel Security Checkpoint)');
          console.warn('📝 Note: Real products will load when deployed to Vercel');

          // Return empty for now - real data will work in production
          return {
            data: [],
            total: 0,
            totalPages: 0,
            currentPage: 1,
            perPage: params.per_page || 20,
          };
        }

        return {
          data: [],
          total: 0,
          totalPages: 0,
          currentPage: 1,
          perPage: params.per_page || 20,
        };
      }

      console.warn('WooCommerce API forbidden, falling back to client-side filtering/pagination');

      // Use the already converted category IDs for client-side filtering
      // This avoids re-fetching categories if params.category was slugs
      const categoryIdsForFilter = convertedCategoryIds;

      try {
        // Fetch all products (limit 100) to perform local operations
        const fallbackParams = {
          ...params,
          search: undefined,
          category: undefined, // Remove category to avoid 403
          orderby: undefined,  // Remove sorting to avoid 403
          order: undefined,
          min_price: undefined, // Remove price filter to avoid 403
          max_price: undefined,
          page: 1,
          per_page: 100,
        };

        const allProductsResponse = await getProducts(fallbackParams);
        let allData = allProductsResponse.data;

        // Filter by category if needed
        if (categoryIdsForFilter) {
          let categoryIds = categoryIdsForFilter.split(',').map((id: string) => parseInt(id.trim()));

          // Also include child categories
          try {
            const allCategories = await getProductCategories();
            const childCategoryIds = allCategories
              .filter(c => categoryIds.includes(c.parent))
              .map(c => c.id);

            if (childCategoryIds.length > 0) {
              categoryIds = [...categoryIds, ...childCategoryIds];
            }
          } catch (catError) {
            console.warn('Failed to fetch categories for child lookup in fallback:', catError);
          }

          allData = allData.filter(p =>
            p.categories && p.categories.some(cat => categoryIds.includes(cat.id))
          );
        }

        // Filter by search if needed
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          allData = allData.filter(p =>
            p.name.toLowerCase().includes(searchLower) ||
            p.short_description?.toLowerCase().includes(searchLower) ||
            p.description?.toLowerCase().includes(searchLower)
          );
        }

        // Filter by price if needed
        if (params.min_price || params.max_price) {
          const minPrice = params.min_price ? parseFloat(params.min_price) : 0;
          const maxPrice = params.max_price ? parseFloat(params.max_price) : Infinity;

          allData = allData.filter(p => {
            const price = parseFloat(p.price || '0');
            return price >= minPrice && price <= maxPrice;
          });
        }

        // Client-side Sorting
        const orderby = params.orderby || 'date';
        const order = params.order || 'desc';

        allData.sort((a, b) => {
          let comparison = 0;
          switch (orderby as string) {
            case 'price':
              const priceA = parseFloat(a.price || '0');
              const priceB = parseFloat(b.price || '0');
              comparison = priceA - priceB;
              break;
            case 'title':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'menu_order':
              comparison = (a.menu_order || 0) - (b.menu_order || 0);
              break;
            case 'date':
            default:
              const dateA = new Date(a.date_created || 0).getTime();
              const dateB = new Date(b.date_created || 0).getTime();
              comparison = dateA - dateB; // Default asc, will be flipped if desc
              break;
          }
          return order === 'desc' ? -comparison : comparison;
        });

        // Calculate pagination
        const total = allData.length;
        const perPage = Number(params.per_page) || 20;
        const currentPage = Number(params.page) || 1;
        const totalPages = Math.ceil(total / perPage);

        // Slice data for current page
        const start = (currentPage - 1) * perPage;
        const end = start + perPage;
        const paginatedData = allData.slice(start, end);

        if (process.env.NODE_ENV === 'development') {
          console.log(`Fallback: Returning ${paginatedData.length} products for page ${currentPage} of ${totalPages}`);
        }

        return {
          data: paginatedData,
          total,
          totalPages,
          currentPage,
          perPage
        };
      } catch (fallbackError) {
        console.error('Fallback operation failed:', fallbackError);
      }
    }

    console.error('Error fetching products:', error);
    return {
      data: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
      perPage: params.per_page || 20,
    };
  }
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: number): Promise<Product | null> {
  try {
    const product = await fetchWooCommerceCached<Product>(
      WC_API_CONFIG.endpoints.productById(id),
      WC_API_CONFIG.cache.productDetail,
      ['products', `product-${id}`]
    );

    if (process.env.NODE_ENV === 'development') {
      console.log(`Fetched product ${id}:`, product.name);
    }
    return product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

/**
 * Get a single product by slug
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const products = await fetchWooCommerceAPI<Product[]>(
      WC_API_CONFIG.endpoints.productBySlug(slug)
    );

    if (!products || products.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`Product with slug "${slug}" not found`);
      }
      return null;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`Fetched product by slug "${slug}":`, products[0].name);
    }
    return products[0];
  } catch (error: any) {
    // Fallback for 403 Forbidden
    if (error?.status === 403) {
      console.warn(`Direct slug fetch for "${slug}" forbidden, falling back to list filtering`);
      try {
        // Fetch all products (limit 100 to be safe)
        const allProducts = await getProducts({ per_page: 100 });
        const product = allProducts.data.find(p => p.slug === slug);

        if (product) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`Found product by slug "${slug}" via fallback list`);
          }
          return product;
        }
      } catch (fallbackError) {
        console.error('Fallback slug fetch failed:', fallbackError);
      }
    }

    console.error(`Error fetching product by slug ${slug}:`, error);
    return null;
  }
}

/**
 * Get multiple products by IDs
 */
export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (!ids || ids.length === 0) {
    return [];
  }

  try {
    const promises = ids.map((id) => getProductById(id));
    const products = await Promise.all(promises);
    return products.filter((p): p is Product => p !== null);
  } catch (error) {
    console.error('Error fetching products by IDs:', error);
    return [];
  }
}

/**
 * Get featured products
 */
export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  try {
    const response = await getProducts({
      per_page: limit,
      featured: true,
      status: 'publish',
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

/**
 * Get products on sale
 */
export async function getOnSaleProducts(limit: number = 8): Promise<Product[]> {
  try {
    const response = await getProducts({
      per_page: limit,
      on_sale: true,
      status: 'publish',
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching sale products:', error);
    return [];
  }
}

/**
 * Search products
 */
export async function searchProducts(
  query: string,
  params: Omit<ProductQueryParams, 'search'> = {}
): Promise<Product[]> {
  try {
    const response = await getProducts({
      ...params,
      search: query,
    });
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  categorySlugOrId: string | number,
  params: ProductQueryParams = {}
) {
  try {
    // Convert slug to ID if needed
    let categoryId: string;

    if (typeof categorySlugOrId === 'string' && isNaN(Number(categorySlugOrId))) {
      // It's a slug, convert to ID
      const category = await getProductCategoryBySlug(categorySlugOrId);
      if (!category) {
        console.warn(`Category with slug "${categorySlugOrId}" not found`);
        return {
          data: [],
          total: 0,
          totalPages: 0,
          currentPage: 1,
          perPage: params.per_page || 20,
        };
      }
      categoryId = String(category.id);
    } else {
      // It's already an ID
      categoryId = String(categorySlugOrId);
    }

    const response = await getProducts({
      ...params,
      category: categoryId,
    });
    return response;
  } catch (error) {
    console.error(`Error fetching products by category ${categorySlugOrId}:`, error);
    return {
      data: [],
      total: 0,
      totalPages: 0,
      currentPage: 1,
      perPage: params.per_page || 20,
    };
  }
}

/**
 * Get products by tag
 */
export async function getProductsByTag(
  tagSlug: string,
  params: ProductQueryParams = {}
): Promise<Product[]> {
  try {
    const response = await getProducts({
      ...params,
      tag: tagSlug,
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching products by tag ${tagSlug}:`, error);
    return [];
  }
}

/**
 * Get related products for a specific product
 */
export async function getRelatedProducts(productId: number, limit: number = 4): Promise<Product[]> {
  try {
    const product = await getProductById(productId);
    if (!product) {
      return [];
    }

    // Get products from the same categories
    const categoryIds = product.categories?.map(cat => cat.id) || [];
    if (categoryIds.length === 0) {
      // If no categories, return featured products as fallback
      return getFeaturedProducts(limit);
    }

    const response = await getProducts({
      per_page: limit + 1, // Get one extra to exclude current product
      category: categoryIds[0].toString(),
      status: 'publish',
    });

    // Filter out the current product
    return response.data.filter(p => p.id !== productId).slice(0, limit);
  } catch (error) {
    console.error(`Error fetching related products for ${productId}:`, error);
    return [];
  }
}

/**
 * Get upsell products for a specific product
 */
export async function getUpsellProducts(productId: number): Promise<Product[]> {
  try {
    const product = await getProductById(productId);
    if (!product || !product.upsell_ids || product.upsell_ids.length === 0) {
      return [];
    }

    return getProductsByIds(product.upsell_ids);
  } catch (error) {
    console.error(`Error fetching upsell products for ${productId}:`, error);
    return [];
  }
}

/**
 * Get cross-sell products for a specific product
 */
export async function getCrossSellProducts(productId: number): Promise<Product[]> {
  try {
    const product = await getProductById(productId);
    if (!product || !product.cross_sell_ids || product.cross_sell_ids.length === 0) {
      return [];
    }

    return getProductsByIds(product.cross_sell_ids);
  } catch (error) {
    console.error(`Error fetching cross-sell products for ${productId}:`, error);
    return [];
  }
}

/**
 * Get parent categories (categories with no parent)
 */
export async function getParentCategories(): Promise<ProductCategoryFull[]> {
  try {
    const categories = await getProductCategories({ parent: 0 });
    return categories;
  } catch (error) {
    console.error('Error fetching parent categories:', error);
    return [];
  }
}

/**
 * Get child categories of a specific parent category
 */
export async function getChildCategories(parentId: number): Promise<ProductCategoryFull[]> {
  try {
    const categories = await getProductCategories({ parent: parentId });
    return categories;
  } catch (error) {
    console.error(`Error fetching child categories for parent ${parentId}:`, error);
    return [];
  }
}

// ============================================================================
// PRODUCT VARIATIONS
// ============================================================================

/**
 * Get product variations
 */
export async function getProductVariations(productId: number): Promise<ProductVariation[]> {
  try {
    const variations = await fetchWooCommerceAPI<ProductVariation[]>(
      WC_API_CONFIG.endpoints.productVariations(productId)
    );
    return variations;
  } catch (error) {
    console.error(`Error fetching variations for product ${productId}:`, error);
    return [];
  }
}

/**
 * Get a single product variation
 */
export async function getProductVariation(
  productId: number,
  variationId: number
): Promise<ProductVariation | null> {
  try {
    const variation = await fetchWooCommerceAPI<ProductVariation>(
      WC_API_CONFIG.endpoints.productVariationById(productId, variationId)
    );
    return variation;
  } catch (error) {
    console.error(`Error fetching variation ${variationId} for product ${productId}:`, error);
    return null;
  }
}

// ============================================================================
// PRODUCT CATEGORIES
// ============================================================================

/**
 * Get all product categories
 */
export async function getProductCategories(
  params: CategoryQueryParams = {}
): Promise<ProductCategoryFull[]> {
  try {
    const queryParams: Record<string, any> = {
      per_page: params.per_page || 100,
      page: params.page || 1,
      orderby: params.orderby || 'id',
      order: params.order || 'asc',
      hide_empty: params.hide_empty !== undefined ? params.hide_empty : false,
    };

    // Only add parent param if explicitly set
    if (params.parent !== undefined) {
      queryParams.parent = params.parent;
    }

    // Build query string
    const queryString = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, String(value));
      }
    });

    const endpoint = `${WC_API_CONFIG.endpoints.productCategories}?${queryString.toString()}`;

    let categories = await fetchWooCommerceCached<ProductCategoryFull[]>(
      endpoint,
      WC_API_CONFIG.cache.categories,
      ['categories']
    );

    // Filter out uncategorized and empty categories
    categories = categories.filter((category) => {
      // Remove "Uncategorized" category
      if (category.slug === 'uncategorized' || category.name.toLowerCase() === 'uncategorized') {
        return false;
      }
      // Remove empty categories if not explicitly showing them
      if (queryParams.hide_empty !== false && category.count === 0) {
        return false;
      }
      return true;
    });

    // Sort by menu_order (WordPress hierarchy) if available
    categories = categories.sort((a, b) => {
      const orderA = a.menu_order || 0;
      const orderB = b.menu_order || 0;
      return orderA - orderB;
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Fetched ${categories.length} product categories (sorted by menu_order, filtered uncategorized/empty)`);
    }

    return categories;
  } catch (error) {
    console.error('Error fetching product categories:', error);
    return [];
  }
}

/**
 * Get a single product category by ID
 */
export async function getProductCategoryById(id: number): Promise<ProductCategoryFull | null> {
  try {
    const category = await fetchWooCommerceCached<ProductCategoryFull>(
      WC_API_CONFIG.endpoints.productCategoryById(id),
      WC_API_CONFIG.cache.categories,
      ['categories', `category-${id}`]
    );
    return category;
  } catch (error) {
    console.error(`Error fetching category ${id}:`, error);
    return null;
  }
}

/**
 * Get a single product category by slug
 */
export async function getProductCategoryBySlug(slug: string): Promise<ProductCategoryFull | null> {
  try {
    const categories = await fetchWooCommerceAPI<ProductCategoryFull[]>(
      WC_API_CONFIG.endpoints.productCategoryBySlug(slug)
    );

    if (!categories || categories.length === 0) {
      return null;
    }

    return categories[0];
  } catch (error) {
    console.error(`Error fetching category by slug ${slug}:`, error);
    return null;
  }
}

// ============================================================================
// PRODUCT TAGS
// ============================================================================

/**
 * Get all product tags
 */
export async function getProductTags(): Promise<ProductTagFull[]> {
  try {
    const tags = await fetchWooCommerceCached<ProductTagFull[]>(
      WC_API_CONFIG.endpoints.productTags,
      WC_API_CONFIG.cache.tags,
      ['tags']
    );
    return tags;
  } catch (error) {
    console.error('Error fetching product tags:', error);
    return [];
  }
}

/**
 * Get a single product tag by ID
 */
export async function getProductTagById(id: number): Promise<ProductTagFull | null> {
  try {
    const tag = await fetchWooCommerceCached<ProductTagFull>(
      WC_API_CONFIG.endpoints.productTagById(id),
      WC_API_CONFIG.cache.tags,
      ['tags', `tag-${id}`]
    );
    return tag;
  } catch (error) {
    console.error(`Error fetching tag ${id}:`, error);
    return null;
  }
}

/**
 * Get a single product tag by slug
 */
export async function getProductTagBySlug(slug: string): Promise<ProductTagFull | null> {
  try {
    const tags = await fetchWooCommerceAPI<ProductTagFull[]>(
      WC_API_CONFIG.endpoints.productTagBySlug(slug)
    );

    if (!tags || tags.length === 0) {
      return null;
    }

    return tags[0];
  } catch (error) {
    console.error(`Error fetching tag by slug ${slug}:`, error);
    return null;
  }
}

// ============================================================================
// PRODUCT REVIEWS
// ============================================================================

/**
 * Get all product reviews
 */
export async function getProductReviews(): Promise<ProductReview[]> {
  try {
    const reviews = await fetchWooCommerceAPI<ProductReview[]>(
      WC_API_CONFIG.endpoints.productReviews
    );
    return reviews;
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    return [];
  }
}

/**
 * Get reviews for a specific product
 */
export async function getReviewsByProductId(productId: number): Promise<ProductReview[]> {
  try {
    const reviews = await fetchWooCommerceAPI<ProductReview[]>(
      WC_API_CONFIG.endpoints.productReviewsByProduct(productId)
    );
    return reviews;
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    return [];
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if product is in stock
 */
export function isProductInStock(product: Product): boolean {
  return product.stock_status === 'instock';
}

/**
 * Check if product is on sale
 */
export function isProductOnSale(product: Product): boolean {
  return product.on_sale && !!product.sale_price;
}

/**
 * Get product price
 */
export function getProductPrice(product: Product): string {
  return product.on_sale && product.sale_price ? product.sale_price : product.price;
}

/**
 * Get discount percentage
 */
export function getDiscountPercentage(product: Product): number {
  if (!product.on_sale || !product.sale_price || !product.regular_price) {
    return 0;
  }

  const regular = parseFloat(product.regular_price);
  const sale = parseFloat(product.sale_price);

  if (regular === 0) return 0;

  return Math.round(((regular - sale) / regular) * 100);
}

/**
 * Format price with currency
 */
export function formatPrice(price: string | number, currency: string = 'SEK'): string {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numericPrice) || numericPrice === 0) {
    return `0 ${currency}`;
  }

  return `${numericPrice.toFixed(2)} ${currency}`;
}

/**
 * Get display price for variable products
 * Returns the lowest variation price if available
 */
export function getVariableProductPrice(product: Product): string {
  // Debug logging for troubleshooting
  const shouldLog = process.env.NODE_ENV === 'development';

  // For variable products, try multiple sources for price
  if (product.type === 'variable') {
    // Convert price to string and check if it's valid
    const priceStr = String(product.price || '');
    const priceNum = parseFloat(priceStr);

    if (shouldLog) {
      console.log('🔍 getVariableProductPrice for:', product.name);
      console.log('  - Price field (raw):', product.price, typeof product.price);
      console.log('  - Price as string:', priceStr);
      console.log('  - Price as number:', priceNum);
    }

    // Check if we have a valid price
    if (priceStr && priceStr !== '0' && priceStr !== '' && !isNaN(priceNum) && priceNum > 0) {
      if (shouldLog) console.log('  ✅ Using product.price:', priceStr);
      return priceStr;
    }

    // Try regular_price as backup
    const regularPriceStr = String(product.regular_price || '');
    const regularPriceNum = parseFloat(regularPriceStr);
    if (regularPriceStr && regularPriceStr !== '0' && regularPriceStr !== '' && !isNaN(regularPriceNum) && regularPriceNum > 0) {
      if (shouldLog) console.log('  ✅ Using product.regular_price:', regularPriceStr);
      return regularPriceStr;
    }

    // Try price_html parsing as fallback
    if (product.price_html) {
      if (shouldLog) console.log('  🔍 Parsing price_html...');

      // Remove HTML tags
      const text = product.price_html.replace(/<[^>]*>/g, '');
      if (shouldLog) console.log('  - Stripped HTML:', text);

      // Try multiple regex patterns

      // Pattern 1: Match number with decimal (comma or dot)
      const decimalMatch = text.match(/(\d+)[.,](\d+)/);
      if (decimalMatch) {
        const price = `${decimalMatch[1]}.${decimalMatch[2]}`;
        if (shouldLog) console.log('  ✅ Decimal match:', price);
        return price;
      }

      // Pattern 2: Match whole number
      const wholeMatch = text.match(/(\d+)/);
      if (wholeMatch && wholeMatch[1]) {
        if (shouldLog) console.log('  ✅ Whole number match:', wholeMatch[1]);
        return wholeMatch[1];
      }
    }

    if (shouldLog) console.log('  ❌ No valid price found, returning 0');
  }

  // Fallback to regular price
  return product.price ? String(product.price) : '0';
}

/**
 * Get stock quantity
 */
export function getStockQuantity(product: Product): number | null {
  return product.stock_quantity;
}

/**
 * Check if product has variations
 */
export function hasVariations(product: Product): boolean {
  return product.type === 'variable' && product.variations.length > 0;
}
