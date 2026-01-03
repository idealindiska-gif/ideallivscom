/**
 * RSS Feed for Blog Posts
 * Standard RSS 2.0 feed for Pinterest and other RSS readers
 * Feed URL: /api/feed
 */

import { NextResponse } from 'next/server';
import { siteConfig } from '@/site.config';

interface WPPost {
  id: number;
  date: string;
  modified: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  link: string;
  author: number;
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
    author?: Array<{
      name: string;
    }>;
  };
}

// Escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Strip HTML tags but preserve basic formatting
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

export async function GET() {
  try {
    // Use the correct WordPress API URL
    const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://crm.ideallivs.com';
    const apiUrl = `${WORDPRESS_URL}/wp-json/wp/v2`;

    console.log('Fetching posts from:', `${apiUrl}/posts`);

    // Fetch recent blog posts from WordPress
    const response = await fetch(
      `${apiUrl}/posts?per_page=50&_embed=true&status=publish&orderby=date&order=desc`,
      {
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WordPress API error:', response.status, errorText);
      throw new Error(`WordPress API error: ${response.status}`);
    }

    const posts: WPPost[] = await response.json();

    if (!posts || posts.length === 0) {
      console.warn('No posts found');
    }

    // Generate RSS feed
    const now = new Date().toUTCString();
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">\n`;
    xml += `  <channel>\n`;
    xml += `    <title><![CDATA[${siteConfig.site_name} Blog]]></title>\n`;
    xml += `    <link>${siteConfig.site_domain}</link>\n`;
    xml += `    <description><![CDATA[${siteConfig.site_description}]]></description>\n`;
    xml += `    <lastBuildDate>${now}</lastBuildDate>\n`;
    xml += `    <language>sv-SE</language>\n`;
    xml += `    <atom:link href="${siteConfig.site_domain}/api/feed" rel="self" type="application/rss+xml" />\n`;

    // Add posts
    for (const post of posts) {
      const title = stripHtml(post.title.rendered);
      const contentHtml = post.content.rendered;
      const excerpt = stripHtml(post.excerpt.rendered);
      const pubDate = new Date(post.date).toUTCString();

      // Get featured image if available
      const featuredImage = post._embedded?.['wp:featuredmedia']?.[0];
      const imageUrl = featuredImage?.source_url || '';
      const imageAlt = featuredImage?.alt_text || title;

      // Get author name
      const authorName = post._embedded?.author?.[0]?.name || siteConfig.site_name;

      // Build content with image
      let fullContent = contentHtml;
      if (imageUrl) {
        fullContent = `<img src="${escapeXml(imageUrl)}" alt="${escapeXml(imageAlt)}" />\n${contentHtml}`;
      }

      xml += `    <item>\n`;
      xml += `      <title><![CDATA[${title}]]></title>\n`;
      xml += `      <link>${escapeXml(post.link)}</link>\n`;
      xml += `      <pubDate>${pubDate}</pubDate>\n`;
      xml += `      <dc:creator><![CDATA[${authorName}]]></dc:creator>\n`;
      xml += `      <guid isPermaLink="true">${escapeXml(post.link)}</guid>\n`;
      xml += `      <description><![CDATA[${excerpt}]]></description>\n`;
      xml += `      <content:encoded><![CDATA[${fullContent}]]></content:encoded>\n`;

      if (imageUrl) {
        xml += `      <media:content url="${escapeXml(imageUrl)}" medium="image">\n`;
        xml += `        <media:title><![CDATA[${imageAlt}]]></media:title>\n`;
        xml += `      </media:content>\n`;
      }

      xml += `    </item>\n`;
    }

    xml += `  </channel>\n`;
    xml += `</rss>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return NextResponse.json(
      { error: 'Failed to generate feed' },
      { status: 500 }
    );
  }
}
