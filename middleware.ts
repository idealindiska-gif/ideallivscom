import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // Redirect non-www to www (SEO: 301 permanent redirect)
  if (host === 'ideallivs.com' || host.startsWith('ideallivs.com:')) {
    const url = request.nextUrl.clone();
    url.host = 'www.ideallivs.com';
    return NextResponse.redirect(url, 301); // 301 = Permanent redirect for SEO
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
