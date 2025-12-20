/**
 * FAQ Schema Generator
 * Framework-agnostic function for generating FAQPage schema
 */

import type { FAQPage, Question } from './types';
import { generateSchemaId, cleanSchema } from './base';

export interface FAQItem {
    question: string;
    answer: string;
}

export interface FAQInput {
    pageUrl: string;
    faqs: FAQItem[];
    name?: string;
    description?: string;
}

/**
 * Generate FAQPage Schema
 *
 * @param config - FAQ configuration
 * @returns Complete FAQPage schema object
 */
export function faqSchema(config: FAQInput): FAQPage {
    const schema: FAQPage = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': generateSchemaId(config.pageUrl, 'faqpage'),
        mainEntity: config.faqs.map(faq => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };

    if (config.name) {
        schema.name = config.name;
    }

    if (config.description) {
        schema.description = config.description;
    }

    return cleanSchema(schema);
}

/**
 * Pre-configured FAQ for Ideal Indiska LIVS
 * Common questions about delivery, products, and services
 */
export function idealIndiskaFAQSchema(baseUrl: string = 'https://www.ideallivs.com'): FAQPage {
    return faqSchema({
        pageUrl: `${baseUrl}/faq`,
        name: 'Frequently Asked Questions - Ideal Indiska LIVS',
        description: 'Common questions about our products, delivery, and services',
        faqs: [
            {
                question: 'Do you offer free delivery in Stockholm?',
                answer: 'Yes! We offer FREE delivery in Stockholm for orders over 500 SEK. For orders between 300-499 SEK, delivery costs 30 SEK. Minimum order is 300 SEK.',
            },
            {
                question: 'Do you deliver outside Stockholm?',
                answer: 'Yes, we deliver across Sweden and all of Europe with DHL. There is no minimum order value for DHL delivery. Rates are calculated at checkout based on your location and order weight.',
            },
            {
                question: 'Do you offer same-day delivery?',
                answer: 'Yes! We offer same-day delivery to nearby areas including Bandhagen, Hagsätra, Högdalen, Farsta, Enskede, Huddinge, Solna, and Sundbyberg. Orders must be placed before 4 PM (16:00) for same-day delivery.',
            },
            {
                question: 'Are your products Halal certified?',
                answer: 'Yes, we specialize in Halal certified products. Our meat and many other products are Halal certified for your peace of mind.',
            },
            {
                question: 'What types of products do you sell?',
                answer: 'We offer a wide range of Indian and Pakistani groceries including Basmati rice, spices and masalas, lentils and pulses, fresh produce, frozen foods, snacks, sweets, cooking oils, and household items.',
            },
            {
                question: 'What are your store opening hours?',
                answer: 'We are open Monday to Friday from 10:00 to 20:00, and Saturday to Sunday from 11:00 to 19:00.',
            },
            {
                question: 'What payment methods do you accept?',
                answer: 'We accept Credit Cards, Debit Cards, Swish, Klarna, Apple Pay, Google Pay, and Cash.',
            },
            {
                question: 'Can I return or exchange products?',
                answer: 'Yes, we have a 14-day return policy for unopened products. Please contact us at hello@ideallivs.com or call +46728494801 for return arrangements.',
            },
            {
                question: 'Do you have a physical store I can visit?',
                answer: 'Yes! Our store is located at Bandhagsplan 4, 124 32 Bandhagen, Stockholm. You are welcome to visit us during our opening hours.',
            },
            {
                question: 'How can I contact you?',
                answer: 'You can reach us by phone at +46728494801 or email at hello@ideallivs.com. We are also active on Facebook, Instagram, and YouTube.',
            },
        ],
    });
}
