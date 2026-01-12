import { getProducts, getProductCategories } from '@/lib/woocommerce';
import { getProductBrands } from '@/lib/woocommerce/brands';
import { translateProducts, translateCategories } from '@/lib/translations';
import { ArchiveTemplate } from '@/components/templates';
import { ShopTopBar } from '@/components/shop/shop-top-bar';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { siteConfig } from '@/site.config';

interface SwedishShopPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    page?: string;
    orderby?: string;
    order?: string;
    category?: string;
    min_price?: string;
    max_price?: string;
    stock_status?: string;
    on_sale?: string;
    featured?: string;
    search?: string;
    brand?: string;
  }>;
}

export async function generateMetadata({ params }: SwedishShopPageProps): Promise<Metadata> {
  const { locale } = await params;

  // Only 'sv' is allowed
  if (locale !== 'sv') {
    notFound();
  }

  const url = `${siteConfig.site_domain}/sv/shop`;
  const urlEn = `${siteConfig.site_domain}/shop`;

  return {
    title: 'Handla indiska och pakistanska livsmedel | Ideal Indiska LIVS',
    description: 'Handla autentiska indiska och pakistanska livsmedel online. Premium Basmati-ris, kryddor, halal-produkter, frysta livsmedel och mer. Leverans i Stockholm och Europa.',
    openGraph: {
      title: 'Handla indiska och pakistanska livsmedel | Ideal Indiska LIVS',
      description: 'Handla autentiska indiska och pakistanska livsmedel online. Premium Basmati-ris, kryddor, halal-produkter, frysta livsmedel och mer.',
      url: url,
      siteName: 'Ideal Indiska LIVS',
      type: 'website',
      locale: 'sv_SE',
    },
    alternates: {
      canonical: url,
      languages: {
        'en': urlEn,
        'en-SE': urlEn,
        'sv': url,
        'sv-SE': url,
        'x-default': urlEn,
      },
    },
  };
}

export default async function SwedishShopPage({ params, searchParams }: SwedishShopPageProps) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;

  // Only 'sv' is allowed
  if (locale !== 'sv') {
    notFound();
  }

  const page = Number(resolvedSearchParams.page) || 1;
  const perPage = 20;

  // Get categories and brands for filters
  const [categoriesRaw, brands] = await Promise.all([
    getProductCategories(),
    getProductBrands({ hide_empty: true })
  ]);

  // Translate categories to Swedish
  const categories = translateCategories(categoriesRaw, 'sv');

  // Build query params (without brand filter for API)
  const queryParams: any = {
    page: resolvedSearchParams.brand ? 1 : page, // Always fetch page 1 if filtering by brand (client-side)
    per_page: resolvedSearchParams.brand ? 100 : perPage, // Fetch more if brand filtering (client-side)
    orderby: resolvedSearchParams.orderby || 'popularity',
    order: (resolvedSearchParams.order as 'asc' | 'desc') || 'desc',
  };

  // Apply filters (excluding brand since we'll handle it client-side)
  if (resolvedSearchParams.category) queryParams.category = resolvedSearchParams.category;
  if (resolvedSearchParams.min_price) queryParams.min_price = resolvedSearchParams.min_price;
  if (resolvedSearchParams.max_price) queryParams.max_price = resolvedSearchParams.max_price;
  if (resolvedSearchParams.stock_status) queryParams.stock_status = resolvedSearchParams.stock_status;
  if (resolvedSearchParams.on_sale) queryParams.on_sale = resolvedSearchParams.on_sale === 'true';
  if (resolvedSearchParams.featured) queryParams.featured = resolvedSearchParams.featured === 'true';
  if (resolvedSearchParams.search) queryParams.search = resolvedSearchParams.search;

  let { data: productsRaw, total, totalPages } = await getProducts(queryParams);

  // Client-side brand filtering if brand param exists
  if (resolvedSearchParams.brand) {
    productsRaw = productsRaw.filter(product =>
      product.brands?.some(b => b.slug === resolvedSearchParams.brand)
    );

    // Recalculate pagination for filtered results
    total = productsRaw.length;
    totalPages = Math.ceil(total / perPage);

    // Apply pagination to filtered results
    const start = (page - 1) * perPage;
    const end = start + perPage;
    productsRaw = productsRaw.slice(start, end);
  }

  // Translate products to Swedish
  const products = translateProducts(productsRaw, 'sv');

  return (
    <ArchiveTemplate
      title="Butik"
      description="Handla autentiska indiska och pakistanska livsmedel online. Premium Basmati-ris, kryddor, halal-produkter, frysta livsmedel och mer."
      breadcrumbs={[{ label: 'Butik' }]}
      products={products}
      totalProducts={total}
      currentPage={page}
      totalPages={totalPages}
      basePath="/sv/shop"
      gridColumns={5}
      filterBar={
        <Suspense fallback={<Skeleton className="h-16 w-full" />}>
          <ShopTopBar
            categories={categories}
            brands={brands}
            totalProducts={total}
          />
        </Suspense>
      }
    />
  );
}
