import type { Product } from '@/types/woocommerce';

type Locale = 'en' | 'sv';

// Import Swedish translations
let productTranslationsSv: Record<string, {
  name?: string;
  short_description?: string;
  description?: string;
}> = {};

let categoryTranslationsSv: Record<string, {
  name?: string;
  description?: string;
}> = {};

// Dynamically import translation files
try {
  productTranslationsSv = require('@/translations/products/sv.json');
} catch (e) {
  console.warn('Swedish product translations not found');
}

try {
  categoryTranslationsSv = require('@/translations/categories/sv.json');
} catch (e) {
  console.warn('Swedish category translations not found');
}

/**
 * Translate a product to the specified locale
 */
export function translateProduct(product: Product, locale: Locale): Product {
  if (locale === 'en') return product;

  const translation = productTranslationsSv[product.slug];
  if (!translation) return product; // Fallback to English

  return {
    ...product,
    name: translation.name || product.name,
    short_description: translation.short_description || product.short_description,
    description: translation.description || product.description,
  };
}

/**
 * Translate a category to the specified locale
 */
export function translateCategory(category: any, locale: Locale): any {
  if (locale === 'en') return category;

  const translation = categoryTranslationsSv[category.slug];
  if (!translation) return category; // Fallback to English

  return {
    ...category,
    name: translation.name || category.name,
    description: translation.description || category.description,
  };
}

/**
 * Translate an array of products
 */
export function translateProducts(products: Product[], locale: Locale): Product[] {
  return products.map(p => translateProduct(p, locale));
}

/**
 * Translate an array of categories
 */
export function translateCategories(categories: any[], locale: Locale): any[] {
  return categories.map(c => translateCategory(c, locale));
}
