import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for handling redirects and URL normalization
 *
 * Handles:
 * 1. Old WordPress category URLs → New Next.js structure
 * 2. /shop/category/* → /product-category/*
 * 3. /shop/product/* → /product/*
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host');
  const { pathname } = url;

  // ============================================================================
  // FORCE WWW REDIRECT (SEO Recovery)
  // ============================================================================
  // Ensures all traffic is consolidated on www.ideallivs.com
  if (host === 'ideallivs.com') {
    url.host = 'www.ideallivs.com';
    return NextResponse.redirect(url, 301);
  }

  // ============================================================================
  // OLD WORDPRESS CATEGORY URLs → /product-category/
  // ============================================================================
  // These are old WooCommerce permalink structures that need to redirect
  const oldCategoryPaths: { [key: string]: string } = {
    '/lentils-beans-dals': '/product-category/lentils-beans-dals',
    '/hair-oils': '/product-category/hair-oils',
    '/flakes': '/product-category/flakes',
    '/paneer-fresh-produce': '/product-category/paneer-fresh-produce',
    '/tea': '/product-category/tea',
    '/indian-snacks': '/product-category/indian-snacks',
    '/henna': '/product-category/henna',
    '/cooking-oil': '/product-category/cooking-oil',
    '/chakki-fresh': '/product-category/chakki-fresh',
    '/cooking-ingredients': '/product-category/cooking-ingredients',
    '/mong-dal': '/product-category/mong-dal',
    '/hair-care': '/product-category/hair-care',
    '/frozen-samosa': '/product-category/frozen-samosa',
    '/home-essentials': '/product-category/home-essentials',
    '/jam': '/product-category/jam',
    // Add more as needed from Search Console
  };

  if (oldCategoryPaths[pathname]) {
    const url = request.nextUrl.clone();
    url.pathname = oldCategoryPaths[pathname];
    return NextResponse.redirect(url, 301); // Permanent redirect
  }

  // ============================================================================
  // /shop/category/* → /product-category/*
  // ============================================================================
  // Redirect duplicate /shop/category/ URLs to canonical /product-category/
  if (pathname.startsWith('/shop/category/')) {
    const categorySlug = pathname.replace('/shop/category/', '');
    const url = request.nextUrl.clone();
    url.pathname = `/product-category/${categorySlug}`;
    return NextResponse.redirect(url, 301); // Permanent redirect
  }

  // ============================================================================
  // /shop/product/* → /product/*
  // ============================================================================
  // Some old links use /shop/product/ instead of /product/
  if (pathname.startsWith('/shop/product/')) {
    const productSlug = pathname.replace('/shop/product/', '');
    const url = request.nextUrl.clone();
    url.pathname = `/product/${productSlug}`;
    return NextResponse.redirect(url, 301); // Permanent redirect
  }

  // ============================================================================
  // /shop/{product-slug} → /product/{product-slug}
  // ============================================================================
  // Handle /shop/india-gate-premium-basmati-rice-5kg → /product/india-gate-premium-basmati-rice-5kg
  // But SKIP /shop itself, /shop/page/*, and /shop with query params
  if (
    pathname.startsWith('/shop/') &&
    !pathname.startsWith('/shop/category/') &&
    !pathname.startsWith('/shop/categories') &&
    pathname !== '/shop' &&
    !pathname.match(/^\/shop\/page\/\d+/)
  ) {
    const productSlug = pathname.replace('/shop/', '');

    // Only redirect if it looks like a product slug (no slashes, not empty)
    if (productSlug && !productSlug.includes('/')) {
      const url = request.nextUrl.clone();
      url.pathname = `/product/${productSlug}`;
      return NextResponse.redirect(url, 301);
    }
  }

  // ============================================================================
  // OLD PAGE URLs Redirects
  // ============================================================================
  const legacyRedirects: { [key: string]: string } = {
    '/shop-by-brand-top-indian-pakistani-grocery-brands-ideal-indiska-stockholm/': '/brands',
    '/shop-by-brand-top-indian-pakistani-grocery-brands-ideal-indiska-stockholm': '/brands',
    '/grocery-delivery-in-goteborg-and-malmo/': '/delivery-goteborg-malmo',
    '/grocery-delivery-in-goteborg-and-malmo': '/delivery-goteborg-malmo',
    '/pages/delivery-information': '/europe-delivery',
  };

  if (legacyRedirects[pathname]) {
    const url = request.nextUrl.clone();
    url.pathname = legacyRedirects[pathname];
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

/**
 * Configure which paths the middleware should run on
 * Don't run on static files, images, or API routes
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml (static files)
     * - api routes
     * - Files with extensions (js, css, images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap|api|.*\..*).*)',
  ],
};
