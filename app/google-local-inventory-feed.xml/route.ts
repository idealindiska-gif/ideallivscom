/**
 * Google Local Inventory Feed (WordPress-compatible URL)
 * Backward compatibility for /google-local-inventory-feed.xml
 * Proxies to /api/google-local-inventory-feed
 */

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const feedUrl = new URL('/api/google-local-inventory-feed', url.origin);

  // Fetch the feed from API route
  const response = await fetch(feedUrl.toString());
  const xml = await response.text();

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    },
  });
}
