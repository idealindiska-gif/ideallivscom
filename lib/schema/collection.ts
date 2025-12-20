/**
 * Collection Page Schema Generator
 * Framework-agnostic function for generating CollectionPage schema
 * Used for blog categories, product listings, etc.
 */

import type { CollectionPage, ItemList } from './types';
import { generateSchemaId, cleanSchema } from './base';

export interface CollectionItem {
    url: string;
    name: string;
    description?: string;
    image?: string;
}

export interface CollectionPageInput {
    name: string;
    description?: string;
    url: string;
    items: CollectionItem[];
    totalItems?: number;
}

/**
 * Generate CollectionPage Schema
 *
 * @param config - Collection page configuration
 * @returns Complete CollectionPage schema object
 */
export function collectionPageSchema(config: CollectionPageInput): CollectionPage {
    const schema: CollectionPage = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': generateSchemaId(config.url, 'collectionpage'),
        name: config.name,
        url: config.url,
    };

    if (config.description) {
        schema.description = config.description;
    }

    // Create ItemList for the collection items
    schema.mainEntity = {
        '@type': 'ItemList',
        numberOfItems: config.totalItems || config.items.length,
        itemListElement: config.items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: item.url,
            name: item.name,
            ...(item.description && { description: item.description }),
            ...(item.image && { image: item.image }),
        })),
    };

    return cleanSchema(schema);
}

/**
 * Generate CollectionPage Schema for Blog Category
 *
 * @param category - Category object
 * @param posts - Array of posts in the category
 * @param baseUrl - Base URL of the site
 * @returns Complete CollectionPage schema object
 */
export function blogCategorySchema(
    category: { name: string; slug: string; description?: string },
    posts: Array<{ slug: string; title: string; excerpt?: string; featuredImage?: string }>,
    baseUrl: string = 'https://www.ideallivs.com'
): CollectionPage {
    return collectionPageSchema({
        name: category.name,
        description: category.description,
        url: `${baseUrl}/category/${category.slug}`,
        items: posts.map(post => ({
            url: `${baseUrl}/${post.slug}`,
            name: post.title,
            description: post.excerpt,
            image: post.featuredImage,
        })),
        totalItems: posts.length,
    });
}

/**
 * Generate CollectionPage Schema for Product Category
 *
 * @param category - Category object
 * @param products - Array of products in the category
 * @param baseUrl - Base URL of the site
 * @returns Complete CollectionPage schema object
 */
export function productCategorySchema(
    category: { name: string; slug: string; description?: string },
    products: Array<{ slug: string; name: string; short_description?: string; images?: any[] }>,
    baseUrl: string = 'https://www.ideallivs.com'
): CollectionPage {
    return collectionPageSchema({
        name: category.name,
        description: category.description,
        url: `${baseUrl}/product-category/${category.slug}`,
        items: products.map(product => ({
            url: `${baseUrl}/product/${product.slug}`,
            name: product.name,
            description: product.short_description,
            image: product.images?.[0]?.src,
        })),
        totalItems: products.length,
    });
}
