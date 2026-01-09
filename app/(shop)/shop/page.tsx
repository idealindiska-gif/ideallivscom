import { getProducts, getProductCategories } from '@/lib/woocommerce';
import { getProductBrands } from '@/lib/woocommerce/brands';
import { ArchiveTemplate } from '@/components/templates';
import { ShopTopBar } from '@/components/shop/shop-top-bar';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Indian & Pakistani Groceries | Ideal Indiska LIVS',
  description: 'Shop authentic Indian & Pakistani groceries online. Premium Basmati rice, spices, halal products, frozen foods & more. Deliveries across Stockholm and Europe.',
};

interface ShopPageProps {
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

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const perPage = 20;

  // Get categories and brands for filters
  const [categories, brands] = await Promise.all([
    getProductCategories(),
    getProductBrands({ hide_empty: true })
  ]);

  // Build query params (without brand filter for API)
  const queryParams: any = {
    page: params.brand ? 1 : page, // Always fetch page 1 if filtering by brand (client-side)
    per_page: params.brand ? 100 : perPage, // Fetch more if brand filtering (client-side)
    orderby: params.orderby || 'popularity',
    order: (params.order as 'asc' | 'desc') || 'desc',
  };

  // Apply filters (excluding brand since we'll handle it client-side)
  if (params.category) queryParams.category = params.category;
  if (params.min_price) queryParams.min_price = params.min_price;
  if (params.max_price) queryParams.max_price = params.max_price;
  if (params.stock_status) queryParams.stock_status = params.stock_status;
  if (params.on_sale) queryParams.on_sale = params.on_sale === 'true';
  if (params.featured) queryParams.featured = params.featured === 'true';
  if (params.search) queryParams.search = params.search;

  let { data: products, total, totalPages } = await getProducts(queryParams);

  // Client-side brand filtering if brand param exists
  if (params.brand) {
    products = products.filter(product =>
      product.brands?.some(b => b.slug === params.brand)
    );

    // Recalculate pagination for filtered results
    total = products.length;
    totalPages = Math.ceil(total / perPage);

    // Apply pagination to filtered results
    const start = (page - 1) * perPage;
    const end = start + perPage;
    products = products.slice(start, end);
  }

  return (
    <ArchiveTemplate
      title="Shop"
      description="Shop authentic Indian & Pakistani groceries online. Premium Basmati rice, spices, halal products, frozen foods & more."
      breadcrumbs={[{ label: 'Shop' }]}
      products={products}
      totalProducts={total}
      currentPage={page}
      totalPages={totalPages}
      basePath="/shop"
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
