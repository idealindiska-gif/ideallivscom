/**
 * Delivery Service Schema Generator
 * Creates DeliveryService and Service schemas for delivery information pages
 */

import type { Organization, Service } from './types';
import { cleanSchema } from './base';

/**
 * Generate Stockholm Delivery Service Schema
 * For /delivery-information page
 */
export function stockholmDeliveryServiceSchema(baseUrl: string = 'https://ideallivs.com') {
  const schema: Service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${baseUrl}/#stockholm-delivery-service`,
    name: 'Stockholm Grocery Delivery Service',
    description: 'Free delivery on orders over 500 SEK to all of Stockholm. Same-day delivery available to nearby areas.',
    provider: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'Ideal Indiska LIVS',
    },
    serviceType: 'Grocery Delivery',
    areaServed: [
      {
        '@type': 'City',
        name: 'Stockholm',
      },
      {
        '@type': 'Place',
        name: 'Södermalm',
      },
      {
        '@type': 'Place',
        name: 'Kungsholmen',
      },
      {
        '@type': 'Place',
        name: 'Norrmalm',
      },
      {
        '@type': 'Place',
        name: 'Vasastan',
      },
      {
        '@type': 'Place',
        name: 'Östermalm',
      },
      {
        '@type': 'Place',
        name: 'Gamla Stan',
      },
      {
        '@type': 'Place',
        name: 'Solna',
      },
      {
        '@type': 'Place',
        name: 'Sundbyberg',
      },
      {
        '@type': 'Place',
        name: 'Huddinge',
      },
      {
        '@type': 'Place',
        name: 'Nacka',
      },
    ],
    offers: [
      {
        '@type': 'Offer',
        name: 'FREE Stockholm Delivery',
        description: 'Free delivery for orders 500 SEK and above',
        price: '0',
        priceCurrency: 'SEK',
        eligibleTransactionVolume: {
          '@type': 'PriceSpecification',
          minPrice: 500,
          priceCurrency: 'SEK',
        },
      },
      {
        '@type': 'Offer',
        name: 'Standard Stockholm Delivery',
        description: 'Flat delivery fee for orders between 300-499 SEK',
        price: '30',
        priceCurrency: 'SEK',
        eligibleTransactionVolume: {
          '@type': 'PriceSpecification',
          minPrice: 300,
          maxPrice: 499.99,
          priceCurrency: 'SEK',
        },
      },
      {
        '@type': 'Offer',
        name: 'Same-Day Evening Delivery',
        description: 'Same-day delivery to nearby areas (order before 4 PM)',
        price: '30',
        priceCurrency: 'SEK',
        areaServed: [
          { '@type': 'Place', name: 'Bandhagen' },
          { '@type': 'Place', name: 'Högdalen' },
          { '@type': 'Place', name: 'Hagsätra' },
          { '@type': 'Place', name: 'Rågsved' },
          { '@type': 'Place', name: 'Stureby' },
          { '@type': 'Place', name: 'Farsta' },
          { '@type': 'Place', name: 'Älvsjö' },
        ],
      },
    ],
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${baseUrl}/shop`,
      servicePhone: '+46728494801',
      availableLanguage: ['Swedish', 'English', 'Hindi', 'Urdu'],
    },
  };

  return cleanSchema(schema);
}

/**
 * Generate Europe Delivery Service Schema
 * For /europe-delivery page
 */
export function europeDeliveryServiceSchema(baseUrl: string = 'https://ideallivs.com') {
  const schema: Service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${baseUrl}/#europe-delivery-service`,
    name: 'Europe-Wide Grocery Delivery Service',
    description: 'Authentic Indian & Pakistani groceries delivered across Europe via DHL. No minimum order, no customs hassle within EU.',
    provider: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'Ideal Indiska LIVS',
    },
    serviceType: 'International Grocery Delivery',
    areaServed: {
      '@type': 'Continent',
      name: 'Europe',
    },
    offers: {
      '@type': 'Offer',
      name: 'DHL Europe Delivery',
      description: 'DHL shipping to all European countries. Rates calculated at checkout based on weight and destination.',
      priceCurrency: 'SEK',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '0.00',
        priceCurrency: 'SEK',
        description: 'DHL rates calculated at checkout based on weight and destination',
      },
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${baseUrl}/shop`,
      servicePhone: '+46728494801',
      availableLanguage: ['Swedish', 'English', 'Hindi', 'Urdu'],
    },
    additionalType: 'https://schema.org/DeliveryEvent',
    hoursAvailable: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
  };

  return cleanSchema(schema);
}

/**
 * Generate Göteborg & Malmö Delivery Service Schema
 * For /delivery-goteborg-malmo page
 */
export function goteborgMalmoDeliveryServiceSchema(baseUrl: string = 'https://ideallivs.com') {
  const schema: Service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${baseUrl}/#goteborg-malmo-delivery-service`,
    name: 'Göteborg & Malmö Grocery Delivery Service',
    description: 'Scheduled delivery of Indian & Pakistani groceries to Göteborg and Malmö via DHL.',
    provider: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'Ideal Indiska LIVS',
    },
    serviceType: 'Scheduled Grocery Delivery',
    areaServed: [
      {
        '@type': 'City',
        name: 'Göteborg',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Göteborg',
          addressRegion: 'Västra Götaland County',
          addressCountry: 'SE',
        },
      },
      {
        '@type': 'City',
        name: 'Malmö',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Malmö',
          addressRegion: 'Skåne County',
          addressCountry: 'SE',
        },
      },
    ],
    offers: {
      '@type': 'Offer',
      name: 'DHL Delivery to Göteborg & Malmö',
      description: 'Scheduled delivery on specific days. Göteborg: Tuesday, Thursday, Saturday. Malmö: Wednesday, Saturday.',
      priceCurrency: 'SEK',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: '0.00',
        priceCurrency: 'SEK',
        description: 'DHL delivery rates calculated at checkout',
      },
    },
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `${baseUrl}/shop`,
      servicePhone: '+46728494801',
      availableLanguage: ['Swedish', 'English', 'Hindi', 'Urdu'],
    },
  };

  return cleanSchema(schema);
}

/**
 * Generate FAQ Page Schema for Delivery
 */
export function deliveryFAQSchema(baseUrl: string = 'https://ideallivs.com') {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is the minimum order for delivery in Stockholm?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The minimum order for our local delivery service in Stockholm is 300 SEK. Orders between 300-499 SEK have a flat delivery fee of 30 SEK. Orders 500 SEK and above get FREE delivery.',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you offer same-day delivery?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! We offer same-day evening delivery to nearby areas including Bandhagen, Högdalen, Hagsätra, Rågsved, Stureby, Farsta, and Älvsjö. Place your order before 4 PM (16:00) to receive delivery the same evening between 7 PM - 10 PM (19:00 - 22:00).',
        },
      },
      {
        '@type': 'Question',
        name: 'Do you deliver to all of Europe?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we deliver to all European countries via DHL. There is no minimum order amount for European deliveries. Shipping costs are calculated at checkout based on weight and destination. Since we ship from Sweden (an EU member), customers in EU countries will not face additional customs fees or import duties.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does delivery take?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'For Stockholm: 1-2 days for standard delivery, same-day for nearby areas. For rest of Sweden via DHL: 2-5 business days. For Europe: 2-4 business days for nearby countries (Denmark, Germany), 4-7 business days for further destinations.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I track my delivery?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, all orders are trackable. You will receive a tracking number via email once your order is dispatched. DHL deliveries include full DHL tracking.',
        },
      },
    ],
  };
}
