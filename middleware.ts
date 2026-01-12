import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n.config';

// Create next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // English no prefix, Swedish gets /sv/
});

/**
 * Detect user's preferred locale
 */
function detectUserLocale(request: NextRequest): string {
  // 1. Check if URL already has /sv/ prefix
  if (request.nextUrl.pathname.startsWith('/sv/')) {
    return 'sv';
  }

  // 2. Check cookie preference
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale === 'sv') {
    return 'sv';
  }

  // 3. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage?.includes('sv')) {
    return 'sv';
  }

  // 4. Default to English (no prefix)
  return 'en';
}

/**
 * Handle legacy redirects with locale awareness
 */
function handleLegacyRedirects(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const locale = detectUserLocale(request);

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
    const destination = locale === 'sv' ? `/sv${oldCategoryPaths[pathname]}` : oldCategoryPaths[pathname];
    return NextResponse.redirect(new URL(destination, request.url), 301);
  }

  // /shop/category/* → /product-category/*
  if (pathname.startsWith('/shop/category/')) {
    const categorySlug = pathname.replace('/shop/category/', '');
    const destination = locale === 'sv' ? `/sv/product-category/${categorySlug}` : `/product-category/${categorySlug}`;
    return NextResponse.redirect(new URL(destination, request.url), 301);
  }

  // /shop/product/* → /product/*
  if (pathname.startsWith('/shop/product/')) {
    const productSlug = pathname.replace('/shop/product/', '');
    const destination = locale === 'sv' ? `/sv/product/${productSlug}` : `/product/${productSlug}`;
    return NextResponse.redirect(new URL(destination, request.url), 301);
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
      const destination = locale === 'sv' ? `/sv/product/${productSlug}` : `/product/${productSlug}`;
      return NextResponse.redirect(new URL(destination, request.url), 301);
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
    const destination = locale === 'sv' ? `/sv${legacyRedirects[pathname]}` : legacyRedirects[pathname];
    return NextResponse.redirect(new URL(destination, request.url), 301);
  }

  return null;
}

/**
 * Middleware for handling locale detection, redirects and URL normalization
 *
 * Handles:
 * 1. Locale detection (English default, Swedish /sv/ prefix)
 * 2. Old WordPress category URLs → New Next.js structure
 * 3. /shop/category/* → /product-category/*
 * 4. /shop/product/* → /product/*
 * 5. WWW redirect for SEO
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
  // LEGACY REDIRECTS (with locale awareness)
  // ============================================================================
  const legacyRedirect = handleLegacyRedirects(request);
  if (legacyRedirect) return legacyRedirect;

  // ============================================================================
  // LOCALE DETECTION (next-intl)
  // ============================================================================
  // English: no prefix (current URLs stay the same)
  // Swedish: /sv/ prefix added
  return intlMiddleware(request);
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: [
    '/((?!api|_next|.*\\..*).*)' // Exclude API, Next.js internals, and files with extensions
  ],
};
