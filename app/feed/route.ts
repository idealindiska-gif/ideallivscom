/**
 * RSS Feed (WordPress-compatible URL)
 * Backward compatibility for /feed URL
 * Redirects to /api/feed
 */

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const feedUrl = new URL('/api/feed', url.origin);

  // Fetch the RSS feed from /api/feed
  const response = await fetch(feedUrl.toString());
  const xml = await response.text();

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    },
  });
}
