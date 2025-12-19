import type { Product, ProductReview } from '@/types/woocommerce';
import { wooCommerceProductSchema, breadcrumbSchema, productBreadcrumbs } from '@/lib/schema';
import { siteConfig } from '@/site.config';

interface ProductSchemaProps {
  product: Product;
  reviews?: ProductReview[];
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function ProductSchema({ product, reviews = [], breadcrumbs }: ProductSchemaProps) {
  const baseUrl = siteConfig.site_domain;

  // Generate product schema using standardized function
  const productSchema = wooCommerceProductSchema(product, {
    baseUrl,
    brandName: 'Ideal Indiska LIVS',
    sellerName: 'Ideal Indiska LIVS',
  });

  // Add reviews to schema if available
  if (reviews && reviews.length > 0) {
    productSchema.review = reviews.map((review) => ({
      '@type': 'Review',
      author: {
        '@type': 'Person',
        name: review.reviewer,
      },
      datePublished: review.date_created,
      reviewBody: review.review.replace(/<[^>]*>/g, ''),
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating.toString(),
        bestRating: '5',
        worstRating: '1',
      },
    }));
  }

  // Generate breadcrumb schema if breadcrumbs provided
  let breadcrumbJsonLd = null;
  if (breadcrumbs && breadcrumbs.length > 0) {
    const breadcrumbItems = breadcrumbs.map(crumb => ({
      name: crumb.label,
      url: crumb.href ? `${baseUrl}${crumb.href}` : undefined,
    }));
    breadcrumbJsonLd = breadcrumbSchema(breadcrumbItems);
  } else if (product.categories && product.categories.length > 0) {
    // Fallback to product breadcrumbs
    const productBreadcrumbItems = productBreadcrumbs(
      {
        name: product.name,
        category: {
          name: product.categories[0].name,
          slug: product.categories[0].slug,
        },
      },
      baseUrl
    );
    breadcrumbJsonLd = breadcrumbSchema(productBreadcrumbItems);
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
    </>
  );
}
