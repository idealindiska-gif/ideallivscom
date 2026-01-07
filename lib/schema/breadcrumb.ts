/**
 * Breadcrumb Schema Generator
 * Framework-agnostic function for generating BreadcrumbList schema
 */

import type { BreadcrumbList, BreadcrumbInput } from './types';
import { cleanSchema } from './base';

/**
 * Generate Breadcrumb Schema
 *
 * @param items - Array of breadcrumb items
 * @param currentPageUrl - URL of the current page (for @id)
 * @returns Complete BreadcrumbList schema object
 */
export function breadcrumbSchema(
  items: BreadcrumbInput[],
  currentPageUrl?: string
): BreadcrumbList {
  const schema: BreadcrumbList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url && { item: item.url }),
    })),
  };

  // Add @id if current page URL provided
  if (currentPageUrl) {
    schema['@id'] = `${currentPageUrl}#breadcrumb`;
  }

  return cleanSchema(schema);
}

/**
 * Build breadcrumb items from a path
 * Useful for automatically generating breadcrumbs from URLs
 *
 * @param path - URL path (e.g., '/shop/category/sweets')
 * @param baseUrl - Base URL of the site
 * @param labels - Optional custom labels for path segments
 * @returns Array of breadcrumb items
 */
export function buildBreadcrumbsFromPath(
  path: string,
  baseUrl: string,
  labels?: Record<string, string>
): BreadcrumbInput[] {
  const breadcrumbs: BreadcrumbInput[] = [
    {
      name: 'Home',
      url: baseUrl,
    },
  ];

  // Remove leading/trailing slashes and split path
  const segments = path.replace(/^\/|\/$/g, '').split('/').filter(Boolean);

  // Build breadcrumb for each segment
  let currentPath = '';
  segments.forEach((segment) => {
    currentPath += `/${segment}`;

    // Use custom label if provided, otherwise capitalize segment
    const label = labels?.[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

    breadcrumbs.push({
      name: label,
      url: `${baseUrl}${currentPath}`,
    });
  });

  return breadcrumbs;
}

/**
 * Generate breadcrumbs for a product page
 * Includes: Home > Shop > Category > Product
 *
 * @param product - Product information
 * @param baseUrl - Base URL of the site
 * @returns Array of breadcrumb items
 */
export function productBreadcrumbs(
  product: {
    name: string;
    category?: { name: string; slug: string };
  },
  baseUrl: string
): BreadcrumbInput[] {
  const breadcrumbs: BreadcrumbInput[] = [
    { name: 'Home', url: baseUrl },
    { name: 'Shop', url: `${baseUrl}/shop` },
  ];

  // Add category if available
  if (product.category) {
    breadcrumbs.push({
      name: product.category.name,
      url: `${baseUrl}/product-category/${product.category.slug}`,
    });
  }

  // Add current product (no URL for last item)
  breadcrumbs.push({
    name: product.name,
  });

  return breadcrumbs;
}

/**
 * Generate breadcrumbs for a category page
 * Includes: Home > Shop > Category
 *
 * @param category - Category information
 * @param baseUrl - Base URL of the site
 * @returns Array of breadcrumb items
 */
export function categoryBreadcrumbs(
  category: {
    name: string;
    parent?: { name: string; slug: string };
  },
  baseUrl: string
): BreadcrumbInput[] {
  const breadcrumbs: BreadcrumbInput[] = [
    { name: 'Home', url: baseUrl },
    { name: 'Shop', url: `${baseUrl}/shop` },
  ];

  // Add parent category if available
  if (category.parent) {
    breadcrumbs.push({
      name: category.parent.name,
      url: `${baseUrl}/product-category/${category.parent.slug}`,
    });
  }

  // Add current category (no URL for last item)
  breadcrumbs.push({
    name: category.name,
  });

  return breadcrumbs;
}

/**
 * Generate breadcrumbs for a blog post
 * Includes: Home > Blog > Category > Post
 *
 * @param post - Post information
 * @param baseUrl - Base URL of the site
 * @returns Array of breadcrumb items
 */
export function postBreadcrumbs(
  post: {
    title: string;
    category?: { name: string; slug: string };
  },
  baseUrl: string
): BreadcrumbInput[] {
  const breadcrumbs: BreadcrumbInput[] = [
    { name: 'Home', url: baseUrl },
    { name: 'Blog', url: `${baseUrl}/blog` },
  ];

  // Add category if available
  if (post.category) {
    breadcrumbs.push({
      name: post.category.name,
      url: `${baseUrl}/blog/category/${post.category.slug}`,
    });
  }

  // Add current post (no URL for last item)
  breadcrumbs.push({
    name: post.title,
  });

  return breadcrumbs;
}
