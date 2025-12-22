import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getBrandBySlug, getProductBrands } from '@/lib/woocommerce/brands';
import { getProducts, getProductCategories } from '@/lib/woocommerce';
import { ArchiveTemplate } from '@/components/templates';
import { ShopTopBar } from '@/components/shop/shop-top-bar';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
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
        min_price?: string;
        max_price?: string;
        stock_status?: string;
        on_sale?: string;
        featured?: string;
        category?: string;
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

    // Get categories and brands for filters
    const [categories, brandsData] = await Promise.all([
        getProductCategories(),
        getProductBrands({ hide_empty: true })
    ]);

    // Fetch products with brand filter
    // WooCommerce Brands plugin requires client-side filtering
    // Fetch multiple pages to ensure we capture all brand products (up to 1000)

    const [page1, page2, page3, page4, page5, page6, page7, page8, page9, page10] = await Promise.all([
        getProducts({ per_page: 100, page: 1, orderby: (resolvedSearchParams.orderby as any) || 'date', order: (resolvedSearchParams.order as 'asc' | 'desc') || 'desc' }),
        getProducts({ per_page: 100, page: 2 }),
        getProducts({ per_page: 100, page: 3 }),
        getProducts({ per_page: 100, page: 4 }),
        getProducts({ per_page: 100, page: 5 }),
        getProducts({ per_page: 100, page: 6 }),
        getProducts({ per_page: 100, page: 7 }),
        getProducts({ per_page: 100, page: 8 }),
        getProducts({ per_page: 100, page: 9 }),
        getProducts({ per_page: 100, page: 10 }),
    ]);

    const allProducts = [
        ...page1.data,
        ...page2.data,
        ...page3.data,
        ...page4.data,
        ...page5.data,
        ...page6.data,
        ...page7.data,
        ...page8.data,
        ...page9.data,
        ...page10.data,
    ];

    console.log(`Fetched ${allProducts.length} total products for brand filtering`);

    // Filter by brand - check multiple ways (brands array, attributes, meta_data)
    const brandProducts = allProducts.filter(product => {
        // Check the brands array (standard WooCommerce Brands plugin)
        if (product.brands?.some((b: any) =>
            b.id === brand.id ||
            b.slug === brand.slug ||
            b.name?.toLowerCase() === brand.name?.toLowerCase()
        )) {
            return true;
        }

        // Check meta_data for brand
        if (product.meta_data) {
            const brandMeta = product.meta_data.find((m: any) =>
                m.key === 'product_brand' ||
                m.key === '_product_brand' ||
                m.key === 'brand' ||
                m.key === '_brand'
            );
            if (brandMeta && (
                brandMeta.value === brand.id.toString() ||
                brandMeta.value === brand.slug ||
                brandMeta.value === brand.name
            )) {
                return true;
            }
        }

        // Check attributes for brand
        if (product.attributes) {
            const brandAttr = product.attributes.find((attr: any) =>
                attr.name?.toLowerCase() === 'brand' ||
                attr.name?.toLowerCase() === 'product brand' ||
                attr.slug === 'pa_brand'
            );
            if (brandAttr && brandAttr.options?.some((opt: string) =>
                opt.toLowerCase() === brand.name?.toLowerCase() ||
                opt.toLowerCase() === brand.slug
            )) {
                return true;
            }
        }

        return false;
    });

    console.log(`Found ${brandProducts.length} products for brand "${brand.slug}"`);

    // Apply other filters client-side if needed (category, price)
    let filteredProducts = brandProducts;
    if (resolvedSearchParams.category) {
        filteredProducts = filteredProducts.filter(p => p.categories.some(c => c.slug === resolvedSearchParams.category));
    }
    // Price filter
    if (resolvedSearchParams.min_price || resolvedSearchParams.max_price) {
        const min = resolvedSearchParams.min_price ? parseFloat(resolvedSearchParams.min_price) : 0;
        const max = resolvedSearchParams.max_price ? parseFloat(resolvedSearchParams.max_price) : Infinity;
        filteredProducts = filteredProducts.filter(p => {
            const price = parseFloat(p.price || '0');
            return price >= min && price <= max;
        });
    }

    const total = filteredProducts.length;
    const totalPages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedProducts = filteredProducts.slice(start, end);


    return (
        <div className="min-h-screen bg-background">
            {/* Products Grid with Filter Bar via ArchiveTemplate */}
            <ArchiveTemplate
                title={`${brand.name}`}
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
                filterBar={
                    <Suspense fallback={<Skeleton className="h-16 w-full" />}>
                        <ShopTopBar
                            categories={categories}
                            brands={brandsData}
                            totalProducts={total}
                        />
                    </Suspense>
                }
            />

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
                            logo: brand.image && typeof brand.image !== 'string' ? brand.image.src : undefined,
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
