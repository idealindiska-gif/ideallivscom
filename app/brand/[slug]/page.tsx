import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getBrandBySlug, getProductBrands } from '@/lib/woocommerce/brands';
import { getProducts } from '@/lib/woocommerce';
import { ArchiveTemplate } from '@/components/templates';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { decodeHtmlEntities } from '@/lib/utils';
import { brandSchema, breadcrumbSchema, productListItem } from '@/lib/schema';
import { siteConfig } from '@/site.config';

interface BrandArchivePageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{
        page?: string;
        orderby?: string;
        order?: string;
    }>;
}

export async function generateMetadata({ params }: BrandArchivePageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const brand = await getBrandBySlug(resolvedParams.slug);

    if (!brand) {
        return {
            title: 'Brand Not Found',
        };
    }

    return {
        title: `${brand.name} Products - Shop by Brand`,
        description: brand.description || `Browse all products from ${brand.name}`,
    };
}

export default async function BrandArchivePage({ params, searchParams }: BrandArchivePageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    const brand = await getBrandBySlug(resolvedParams.slug);

    if (!brand) {
        notFound();
    }

    const page = Number(resolvedSearchParams.page) || 1;
    const perPage = 20;

    // Fetch all products and filter by brand client-side
    // This is because WooCommerce API might not support product_brand filtering directly
    const allProductsResponse = await getProducts({
        per_page: 100, // Fetch more products to filter from
        page: 1,
        orderby: (resolvedSearchParams.orderby as any) || 'date',
        order: (resolvedSearchParams.order as 'asc' | 'desc') || 'desc',
    });

    // Filter products that have this brand
    const brandProducts = allProductsResponse.data.filter(product =>
        product.brands?.some(b => b.id === brand.id || b.slug === brand.slug)
    );

    // Paginate filtered results
    const total = brandProducts.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedProducts = brandProducts.slice(start, end);

    return (
        <div className="min-h-screen bg-background">
            {/* Brand Header */}
            <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-12 md:py-16 border-b border-border">
                <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-screen-2xl">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        {/* Brand Logo */}
                        {brand.image?.src ? (
                            <div className="relative w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl border-2 border-border shadow-lg p-4 flex-shrink-0">
                                <Image
                                    src={brand.image.src}
                                    alt={brand.image.alt || brand.name}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 768px) 96px, 128px"
                                    priority
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-primary/10 rounded-2xl border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                                <span className="text-4xl md:text-5xl font-bold text-primary">
                                    {brand.name.charAt(0)}
                                </span>
                            </div>
                        )}

                        {/* Brand Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary mb-3">
                                {decodeHtmlEntities(brand.name)}
                            </h1>
                            {brand.description && (
                                <div
                                    className="text-lg text-muted-foreground max-w-3xl prose prose-sm"
                                    dangerouslySetInnerHTML={{ __html: brand.description }}
                                />
                            )}
                            <p className="mt-4 text-sm font-medium text-primary">
                                {total} {total === 1 ? 'Product' : 'Products'} Available
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-screen-2xl">
                    <ArchiveTemplate
                        title={`${brand.name} Products`}
                        description={brand.description || `Browse all products from ${brand.name}`}
                        breadcrumbs={[
                            { label: 'Shop', href: '/shop' },
                            { label: 'Brands', href: '/brands' },
                            { label: brand.name }
                        ]}
                        products={paginatedProducts}
                        totalProducts={total}
                        currentPage={page}
                        totalPages={totalPages}
                        basePath={`/brand/${brand.slug}`}
                        gridColumns={5}
                    />
                </div>
            </section>

            {/* SEO Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'CollectionPage',
                        '@id': `${siteConfig.site_domain}/brand/${brand.slug}`,
                        name: `${brand.name} Products`,
                        description: brand.description || `Browse all products from ${brand.name}`,
                        url: `${siteConfig.site_domain}/brand/${brand.slug}`,
                        about: brandSchema(brand.name, {
                            url: `${siteConfig.site_domain}/brand/${brand.slug}`,
                            logo: brand.image?.src,
                            description: brand.description,
                        }),
                        mainEntity: {
                            '@type': 'ItemList',
                            numberOfItems: total,
                            itemListElement: paginatedProducts.map((product, index) =>
                                productListItem(
                                    {
                                        name: product.name,
                                        description: product.short_description,
                                        images: product.images,
                                        sku: product.sku,
                                        price: product.price,
                                        currency: 'SEK',
                                        url: `${siteConfig.site_domain}/product/${product.slug}`,
                                        brand: brand.name,
                                        availability: product.stock_status === 'instock' ? 'InStock' : 'OutOfStock',
                                    },
                                    index + 1,
                                    {
                                        brandName: brand.name,
                                        sellerName: 'Ideal Indiska LIVS',
                                    }
                                )
                            ),
                        },
                    })
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema([
                        { name: 'Home', url: siteConfig.site_domain },
                        { name: 'Shop', url: `${siteConfig.site_domain}/shop` },
                        { name: 'Brands', url: `${siteConfig.site_domain}/brands` },
                        { name: brand.name },
                    ]))
                }}
            />
        </div>
    );
}
