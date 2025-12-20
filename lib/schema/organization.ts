/**
 * Organization Schema Generator
 * Framework-agnostic function for generating Organization/GroceryStore schema
 */

import type { Organization, OrganizationInput } from './types';
import { generateSchemaId, formatOpeningHours, cleanSchema } from './base';

/**
 * Generate Organization Schema (GroceryStore, LocalBusiness, etc.)
 *
 * @param config - Organization configuration
 * @returns Complete Organization schema object
 */
export function organizationSchema(config: OrganizationInput): Organization {
  const schema: Organization = {
    '@context': 'https://schema.org',
    '@type': config.types || ['Organization', 'GroceryStore', 'LocalBusiness'],
    '@id': generateSchemaId(config.url, 'organization'),
    name: config.name,
    url: config.url,
  };

  // Optional fields
  if (config.alternateName) {
    schema.alternateName = config.alternateName;
  }

  if (config.description) {
    schema.description = config.description;
  }

  if (config.logo) {
    schema.logo = {
      '@type': 'ImageObject',
      url: config.logo,
    };
  }

  if (config.image) {
    schema.image = config.image;
  }

  if (config.telephone) {
    schema.telephone = config.telephone;
  }

  if (config.email) {
    schema.email = config.email;
  }

  if (config.address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: config.address.street,
      addressLocality: config.address.city,
      postalCode: config.address.postalCode,
      addressCountry: config.address.country,
      ...(config.address.region && { addressRegion: config.address.region }),
    };
  }

  if (config.geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: config.geo.latitude,
      longitude: config.geo.longitude,
    };
  }

  if (config.openingHours && config.openingHours.length > 0) {
    schema.openingHoursSpecification = formatOpeningHours(config.openingHours);
  }

  if (config.cuisine && config.cuisine.length > 0) {
    schema.servesCuisine = config.cuisine;
  }

  if (config.priceRange) {
    schema.priceRange = config.priceRange;
  }

  if (config.socialMedia && config.socialMedia.length > 0) {
    schema.sameAs = config.socialMedia.filter(Boolean);
  }

  if (config.foundingDate) {
    schema.foundingDate = config.foundingDate;
  }

  return cleanSchema(schema);
}

/**
 * Pre-configured Ideal Indiska LIVS Organization Schema
 * Grocery Store focused schema with delivery services
 */
export function idealIndiskaOrganizationSchema(baseUrl: string = 'https://www.ideallivs.com'): Organization {
  return organizationSchema({
    name: 'Ideal Indiska LIVS',
    alternateName: 'Ideal Livs',
    description: 'Indian & Pakistani Grocery Store in Stockholm, now delivering across Europe with DHL. Free delivery from 500kr in Stockholm (min. order 300kr with 30kr fee). Same-day delivery available.',
    url: baseUrl,
    logo: 'https://crm.ideallivs.com/wp-content/uploads/2025/04/final-new-logo-black.png',
    image: 'https://crm.ideallivs.com/wp-content/uploads/2025/07/ideal-indiska-livs-stockholm.jpg',
    telephone: '+46728494801',
    email: 'hello@ideallivs.com',
    address: {
      street: 'Bandhagsplan 4',
      city: 'Bandhagen',
      region: 'Stockholm County',
      postalCode: '124 32',
      country: 'SE',
    },
    geo: {
      latitude: 59.2700036,
      longitude: 18.0486904,
    },
    openingHours: [
      { day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '20:00' },
      { day: ['Saturday', 'Sunday'], opens: '11:00', closes: '19:00' },
    ],
    priceRange: '$$',
    socialMedia: [
      'https://www.facebook.com/Ideal.indiska.livs',
      'https://www.instagram.com/ideal_indiska_livs/',
      'https://www.youtube.com/@Idealindiska',
      'https://g.co/kgs/5e3Ufch',
    ],
    foundingDate: '2020',
    types: ['Organization', 'GroceryStore', 'LocalBusiness'],
  });
}

/**
 * Full-featured Ideal Indiska LIVS Organization Schema
 * Includes delivery services, payment methods, and service areas
 */
export function idealIndiskaOrganizationSchemaFull(baseUrl: string = 'https://www.ideallivs.com'): Organization {
  const baseSchema = idealIndiskaOrganizationSchema(baseUrl);

  return {
    ...baseSchema,

    slogan: 'Everything You Need. Just Around the Corner.',

    // Payment methods
    paymentAccepted: [
      'Credit Card',
      'Debit Card',
      'Visa',
      'MasterCard',
      'Apple Pay',
      'Google Pay',
      'Klarna',
      'Swish',
      'Cash',
    ],
    currenciesAccepted: 'SEK',

    // Products/Categories offered
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Indian & Pakistani Groceries',
      description: 'Complete range of authentic Indian and Pakistani food products',
    },

    // Knowledge areas
    knowsAbout: [
      'Indian Groceries',
      'Pakistani Food Products',
      'Asian Spices',
      'Halal Products',
      'Basmati Rice',
      'Indian Sweets',
      'Frozen Indian Food',
    ],

    // Delivery Services
    makesOffer: [
      // Stockholm Delivery (300-499kr)
      {
        '@type': 'Offer',
        name: 'Stockholm Delivery',
        description: 'Local delivery within Stockholm for orders under 500kr',
        priceSpecification: {
          '@type': 'DeliveryChargeSpecification',
          price: '30.00',
          priceCurrency: 'SEK',
          eligibleTransactionVolume: {
            '@type': 'PriceSpecification',
            minPrice: 300,
            maxPrice: 499.99,
            priceCurrency: 'SEK',
          },
        },
        areaServed: {
          '@type': 'DefinedRegion',
          addressCountry: 'SE',
          addressRegion: 'Stockholm County',
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: '30.00',
            currency: 'SEK',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            businessDays: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            },
            cutoffTime: '20:00',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 0,
              maxValue: 1,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 2,
              unitCode: 'DAY',
            },
          },
          doesNotShip: false,
          shippingLabel: 'Stockholm Delivery (Under 500kr)',
        },
      },
      // FREE Stockholm Delivery (500kr+)
      {
        '@type': 'Offer',
        name: 'FREE Stockholm Delivery',
        description: 'Free delivery for orders 500kr and above',
        priceSpecification: {
          '@type': 'DeliveryChargeSpecification',
          price: '0.00',
          priceCurrency: 'SEK',
          eligibleTransactionVolume: {
            '@type': 'PriceSpecification',
            minPrice: 500,
            priceCurrency: 'SEK',
          },
        },
        areaServed: {
          '@type': 'DefinedRegion',
          addressCountry: 'SE',
          addressRegion: 'Stockholm County',
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: '0.00',
            currency: 'SEK',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            businessDays: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            },
            cutoffTime: '20:00',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 0,
              maxValue: 1,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 2,
              unitCode: 'DAY',
            },
          },
          doesNotShip: false,
          shippingLabel: 'FREE Stockholm Delivery (500kr+)',
        },
      },
      // Same-Day Delivery
      {
        '@type': 'Offer',
        name: 'Same-Day Local Delivery',
        description: 'Same-day delivery to nearby areas',
        areaServed: [
          { '@type': 'Place', name: 'Bandhagen' },
          { '@type': 'Place', name: 'Hagsätra' },
          { '@type': 'Place', name: 'Högdalen' },
          { '@type': 'Place', name: 'Farsta' },
          { '@type': 'Place', name: 'Enskede' },
          { '@type': 'Place', name: 'Huddinge' },
          { '@type': 'Place', name: 'Solna' },
          { '@type': 'Place', name: 'Sundbyberg' },
        ],
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: '30.00',
            currency: 'SEK',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            cutoffTime: '16:00',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 0,
              maxValue: 0,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 0,
              maxValue: 0,
              unitCode: 'DAY',
            },
          },
          doesNotShip: false,
          shippingLabel: 'Same Day Delivery',
        },
      },
      // DHL Europe Delivery
      {
        '@type': 'Offer',
        name: 'DHL Europe Delivery',
        description: 'Delivery to all of Europe with DHL. No minimum order value. Rates calculated at checkout.',
        areaServed: {
          '@type': 'DefinedRegion',
          addressCountry: [
            'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
            'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
            'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'NO', 'CH',
          ],
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: '0.00',
            currency: 'SEK',
            description: 'DHL rates calculated at checkout',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            businessDays: {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            },
            cutoffTime: '20:00',
            handlingTime: {
              '@type': 'QuantitativeValue',
              minValue: 1,
              maxValue: 2,
              unitCode: 'DAY',
            },
            transitTime: {
              '@type': 'QuantitativeValue',
              minValue: 3,
              maxValue: 7,
              unitCode: 'DAY',
            },
          },
          carrier: {
            '@type': 'Organization',
            name: 'DHL',
            url: 'https://www.dhl.com',
          },
          doesNotShip: false,
          shippingLabel: 'DHL Europe Delivery (Rates calculated at checkout)',
        },
      },
    ],

    // Service areas
    areaServed: [
      {
        '@type': 'City',
        name: 'Stockholm',
      },
      {
        '@type': 'Country',
        name: 'Sweden',
      },
      {
        '@type': 'Continent',
        name: 'Europe',
      },
    ],

    // Amenities
    amenityFeature: [
      { '@type': 'LocationFeatureSpecification', name: 'Halal Certified', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Fresh Produce', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Frozen Foods', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'International Brands', value: true },
      { '@type': 'LocationFeatureSpecification', name: 'Online Shopping', value: true },
    ],

    // Aggregate rating (placeholder - update with real data)
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '150',
      bestRating: '5',
      worstRating: '1',
    },

    // Order action
    potentialAction: {
      '@type': 'OrderAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: baseUrl + '/shop/',
      },
    },
  };
}

// Keep legacy exports for backward compatibility
export { anmolOrganizationSchema, anmolOrganizationSchemaFull };

// Legacy function - kept for backward compatibility but updated to use Ideal Indiska
function anmolOrganizationSchema(baseUrl: string = 'https://www.ideallivs.com'): Organization {
  return idealIndiskaOrganizationSchema(baseUrl);
}

function anmolOrganizationSchemaFull(baseUrl: string = 'https://www.ideallivs.com'): Organization {
  return idealIndiskaOrganizationSchemaFull(baseUrl);
}
