import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Handle legacy redirects - simplified without locale routing
 */
function handleLegacyRedirects(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  // Old WordPress category URLs → /product-category/
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
  };

  if (oldCategoryPaths[pathname]) {
    return NextResponse.redirect(new URL(oldCategoryPaths[pathname], request.url), 301);
  }

  // Redirect /sv/* to non-locale version (disable Swedish)
  if (pathname.startsWith('/sv/') || pathname === '/sv') {
    const newPath = pathname.replace('/sv', '') || '/';
    return NextResponse.redirect(new URL(newPath, request.url), 301);
  }

  // /shop/category/* → /product-category/*
  if (pathname.startsWith('/shop/category/')) {
    const categorySlug = pathname.replace('/shop/category/', '');
    return NextResponse.redirect(new URL(`/product-category/${categorySlug}`, request.url), 301);
  }

  // /shop/product/* → /product/*
  if (pathname.startsWith('/shop/product/')) {
    const productSlug = pathname.replace('/shop/product/', '');
    return NextResponse.redirect(new URL(`/product/${productSlug}`, request.url), 301);
  }

  // /shop/{product-slug} → /product/{product-slug}
  if (
    pathname.startsWith('/shop/') &&
    !pathname.startsWith('/shop/category/') &&
    !pathname.startsWith('/shop/categories') &&
    pathname !== '/shop' &&
    !pathname.match(/^\/shop\/page\/\d+/)
  ) {
    const productSlug = pathname.replace('/shop/', '');
    if (productSlug && !productSlug.includes('/')) {
      return NextResponse.redirect(new URL(`/product/${productSlug}`, request.url), 301);
    }
  }

  // Old page URLs redirects
  const legacyRedirects: { [key: string]: string } = {
    '/shop-by-brand-top-indian-pakistani-grocery-brands-ideal-indiska-stockholm/': '/brands',
    '/shop-by-brand-top-indian-pakistani-grocery-brands-ideal-indiska-stockholm': '/brands',
    '/grocery-delivery-in-goteborg-and-malmo/': '/delivery-goteborg-malmo',
    '/grocery-delivery-in-goteborg-and-malmo': '/delivery-goteborg-malmo',
    '/special-offers/': '/deals',
    '/special-offers': '/deals',
    '/pages/delivery-information': '/europe-delivery',
  };

  if (legacyRedirects[pathname]) {
    return NextResponse.redirect(new URL(legacyRedirects[pathname], request.url), 301);
  }

  return null;
}

/**
 * Simplified Middleware - Multilingual DISABLED
 * 
 * Handles:
 * 1. WWW redirect for SEO
 * 2. Legacy URL redirects
 * 3. Redirects /sv/* to non-locale version
 */
export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host');
  const { pathname } = url;

  // Skip API routes, static files
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    /\.(ico|png|jpg|jpeg|svg|webp|xml|txt)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // ============================================================================
  // FORCE WWW REDIRECT (SEO Recovery)
  // ============================================================================
  if (host === 'ideallivs.com') {
    url.host = 'www.ideallivs.com';
    return NextResponse.redirect(url, 301);
  }

  // ============================================================================
  // LEGACY REDIRECTS
  // ============================================================================
  const legacyRedirect = handleLegacyRedirects(request);
  if (legacyRedirect) return legacyRedirect;

  // No locale routing - just pass through
  return NextResponse.next();
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    '/((?!api|_next|.*\\..*).*)' // Exclude API, Next.js internals, and files with extensions
  ],
};
