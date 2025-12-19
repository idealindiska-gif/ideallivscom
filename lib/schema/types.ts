/**
 * JSON-LD Schema Type Definitions
 * Framework-agnostic type definitions for structured data
 */

// Base Types
export interface ImageObject {
  '@type': 'ImageObject';
  url: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface PostalAddress {
  '@type': 'PostalAddress';
  streetAddress: string;
  addressLocality: string;
  addressRegion?: string;
  postalCode: string;
  addressCountry: string;
}

export interface GeoCoordinates {
  '@type': 'GeoCoordinates';
  latitude: number;
  longitude: number;
}

export interface OpeningHoursSpecification {
  '@type': 'OpeningHoursSpecification';
  dayOfWeek: string | string[];
  opens: string;
  closes: string;
  description?: string;
}

// Brand Schema
export interface Brand {
  '@type': 'Brand';
  name: string;
  url?: string;
  logo?: string | ImageObject;
  description?: string;
}

// Organization Schema
export interface Organization {
  '@context': 'https://schema.org';
  '@type': string | string[];
  '@id'?: string;
  name: string;
  alternateName?: string;
  description?: string;
  url: string;
  image?: string | ImageObject;
  logo?: ImageObject;
  telephone?: string;
  email?: string;
  address?: PostalAddress;
  geo?: GeoCoordinates;
  openingHoursSpecification?: OpeningHoursSpecification[];
  servesCuisine?: string[];
  paymentAccepted?: string[];
  currenciesAccepted?: string;
  priceRange?: string;
  sameAs?: string[];
  foundingDate?: string;
  [key: string]: unknown;
}

// Offer Schema
export interface Offer {
  '@type': 'Offer' | 'AggregateOffer';
  price?: string | number;
  lowPrice?: string | number;
  highPrice?: string | number;
  priceCurrency: string;
  availability: string;
  url?: string;
  priceValidUntil?: string;
  seller?: {
    '@type': 'Organization';
    name: string;
  };
  itemCondition?: string;
  [key: string]: unknown;
}

// Product Schema
export interface Product {
  '@context'?: 'https://schema.org';
  '@type': 'Product';
  '@id'?: string;
  name: string;
  description?: string;
  image?: string | string[] | ImageObject | ImageObject[];
  sku?: string;
  mpn?: string;
  gtin?: string;
  gtin8?: string;
  gtin12?: string;
  gtin13?: string;
  gtin14?: string;
  brand?: Brand;
  offers?: Offer;
  aggregateRating?: {
    '@type': 'AggregateRating';
    ratingValue: number;
    reviewCount: number;
    bestRating?: number;
    worstRating?: number;
  };
  review?: unknown[];
  category?: string;
  url?: string;
  [key: string]: unknown;
}

// Category/CollectionPage Schema
export interface CollectionPage {
  '@context'?: 'https://schema.org';
  '@type': 'CollectionPage';
  '@id'?: string;
  name: string;
  description?: string;
  url: string;
  isPartOf?: {
    '@id': string;
  };
  mainEntity?: {
    '@type': 'ItemList';
    numberOfItems: number;
    itemListElement: unknown[];
  };
}

// Breadcrumb Schema
export interface BreadcrumbList {
  '@context'?: 'https://schema.org';
  '@type': 'BreadcrumbList';
  '@id'?: string;
  itemListElement: {
    '@type': 'ListItem';
    position: number;
    name: string;
    item?: string;
  }[];
}

// Website Schema
export interface WebSite {
  '@context'?: 'https://schema.org';
  '@type': 'WebSite';
  '@id'?: string;
  name: string;
  url: string;
  description?: string;
  publisher?: {
    '@id': string;
  };
  potentialAction?: {
    '@type': 'SearchAction';
    target: {
      '@type': 'EntryPoint';
      urlTemplate: string;
    };
    'query-input': string;
  };
}

// WebPage Schema
export interface WebPage {
  '@context'?: 'https://schema.org';
  '@type': 'WebPage';
  '@id'?: string;
  name: string;
  url: string;
  description?: string;
  isPartOf?: {
    '@id': string;
  };
  inLanguage?: string;
  datePublished?: string;
  dateModified?: string;
}

// Article/BlogPosting Schema
export interface BlogPosting {
  '@context'?: 'https://schema.org';
  '@type': 'BlogPosting' | 'Article';
  '@id'?: string;
  headline: string;
  description?: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  author?: {
    '@type': 'Person';
    name: string;
  };
  publisher?: {
    '@type': 'Organization';
    name: string;
    logo?: ImageObject;
  };
  image?: ImageObject | string;
  articleBody?: string;
  articleSection?: string;
  wordCount?: number;
  keywords?: string;
  inLanguage?: string;
  [key: string]: unknown;
}

// Alias for BlogPosting
export type Article = BlogPosting;

// ItemList Schema
export interface ItemList {
  '@context'?: 'https://schema.org';
  '@type': 'ItemList';
  '@id'?: string;
  numberOfItems: number;
  itemListElement: unknown[];
  name?: string;
  description?: string;
}

// FAQ Schema Types
export interface Question {
  '@type': 'Question';
  name: string;
  acceptedAnswer: {
    '@type': 'Answer';
    text: string;
  };
}

export interface FAQPage {
  '@context'?: 'https://schema.org';
  '@type': 'FAQPage';
  '@id'?: string;
  name?: string;
  description?: string;
  mainEntity: Question[];
}


// Graph Schema (for combining multiple schemas)
export interface Graph {
  '@context': 'https://schema.org';
  '@graph': unknown[];
}

// Input Types for Schema Generators
export interface OrganizationInput {
  name: string;
  alternateName?: string;
  description?: string;
  url: string;
  logo?: string;
  image?: string;
  telephone?: string;
  email?: string;
  address: {
    street: string;
    city: string;
    region?: string;
    postalCode: string;
    country: string;
  };
  geo?: {
    latitude: number;
    longitude: number;
  };
  openingHours?: Array<{
    day: string | string[];
    opens: string;
    closes: string;
  }>;
  cuisine?: string[];
  priceRange?: string;
  socialMedia?: string[];
  foundingDate?: string;
  types?: string[];
}

export interface ProductInput {
  name: string;
  description?: string;
  shortDescription?: string;
  images?: Array<{ src: string; alt?: string }>;
  sku?: string;
  gtin?: string;
  price?: number | string;
  salePrice?: number | string;
  regularPrice?: number | string;
  currency?: string;
  inStock?: boolean;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder' | 'BackOrder';
  url?: string;
  brand?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  isVariable?: boolean;
  lowPrice?: number | string;
  highPrice?: number | string;
  seller?: string;
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
}

export interface BreadcrumbInput {
  name: string;
  url?: string;
}

export interface CategoryInput {
  name: string;
  description?: string;
  url: string;
  products?: ProductInput[];
  websiteId?: string;
}

// Service Schema
export interface Service {
  '@context'?: 'https://schema.org';
  '@type': 'Service';
  '@id'?: string;
  name: string;
  description?: string;
  provider?: {
    '@type': 'Organization';
    '@id'?: string;
    name: string;
  };
  serviceType?: string;
  areaServed?: unknown;
  offers?: unknown;
  availableChannel?: {
    '@type': 'ServiceChannel';
    serviceUrl?: string;
    servicePhone?: string;
    availableLanguage?: string[];
  };
  additionalType?: string;
  hoursAvailable?: unknown;
  [key: string]: unknown;
}
