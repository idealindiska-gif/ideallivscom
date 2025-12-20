/**
 * Article/Blog Post Schema Generator
 * Framework-agnostic function for generating Article/BlogPosting schema
 */

import type { Article, BlogPosting } from './types';
import { generateSchemaId, cleanSchema } from './base';

export interface ArticleInput {
    title: string;
    description: string;
    content: string;
    url: string;
    authorName: string;
    publisherName: string;
    publisherLogo: string;
    datePublished: string;
    dateModified?: string;
    featuredImage?: string;
    category?: string;
    tags?: string[];
    wordCount?: number;
    language?: string;
}

/**
 * Generate Article/BlogPosting Schema
 *
 * @param article - Article configuration
 * @returns Complete Article schema object
 */
export function articleSchema(article: ArticleInput): BlogPosting {
    const schema: BlogPosting = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        '@id': generateSchemaId(article.url, 'article'),
        headline: article.title,
        description: article.description,
        url: article.url,
        datePublished: article.datePublished,
        dateModified: article.dateModified || article.datePublished,
        inLanguage: article.language || 'sv-SE',
        author: {
            '@type': 'Person',
            name: article.authorName,
        },
        publisher: {
            '@type': 'Organization',
            name: article.publisherName,
            logo: {
                '@type': 'ImageObject',
                url: article.publisherLogo,
            },
        },
    };

    if (article.featuredImage) {
        schema.image = {
            '@type': 'ImageObject',
            url: article.featuredImage,
        };
    }

    if (article.content) {
        schema.articleBody = stripHtmlTags(article.content);
    }

    if (article.wordCount) {
        schema.wordCount = article.wordCount;
    }

    if (article.category) {
        schema.articleSection = article.category;
    }

    if (article.tags && article.tags.length > 0) {
        schema.keywords = article.tags.join(', ');
    }

    return cleanSchema(schema);
}

/**
 * Generate Article Schema from WordPress Post
 *
 * @param post - WordPress post object
 * @param baseUrl - Base URL of the site
 * @returns Complete Article schema object
 */
export function wordPressArticleSchema(post: any, baseUrl: string = 'https://www.ideallivs.com'): BlogPosting {
    const url = `${baseUrl}/${post.slug}`;

    // Extract featured image
    const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

    // Extract author name
    const authorName = post._embedded?.author?.[0]?.name || 'Ideal Indiska LIVS';

    // Extract categories
    const categories = post._embedded?.['wp:term']?.[0] || [];
    const category = categories.length > 0 ? categories[0].name : undefined;

    // Extract tags
    const tags = post._embedded?.['wp:term']?.[1]?.map((tag: any) => tag.name) || [];

    return articleSchema({
        title: stripHtmlTags(post.title.rendered),
        description: stripHtmlTags(post.excerpt.rendered).substring(0, 160),
        content: post.content.rendered,
        url,
        authorName,
        publisherName: 'Ideal Indiska LIVS',
        publisherLogo: 'https://crm.ideallivs.com/wp-content/uploads/2025/04/final-new-logo-black.png',
        datePublished: post.date,
        dateModified: post.modified,
        featuredImage,
        category,
        tags,
        wordCount: countWords(post.content.rendered),
        language: 'sv-SE',
    });
}

/**
 * Helper function to strip HTML tags
 */
function stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * Helper function to count words in HTML content
 */
function countWords(html: string): number {
    const text = stripHtmlTags(html);
    return text.split(/\s+/).filter(word => word.length > 0).length;
}
