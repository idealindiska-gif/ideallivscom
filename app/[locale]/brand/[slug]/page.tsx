import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getBrandBySlug, getProductBrands } from '@/lib/woocommerce/brands';
import { getProducts, getProductCategories } from '@/lib/woocommerce';
import { translateProducts, translateCategories } from '@/lib/translations';
import { ArchiveTemplate } from '@/components/templates';
import { ShopTopBar } from '@/components/shop/shop-top-bar';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { decodeHtmlEntities } from '@/lib/utils';
import { brandSchema, breadcrumbSchema, productListItem } from '@/lib/schema';
import { siteConfig } from '@/site.config';

// ISR: Revalidate brand pages every 2 hours
export const revalidate = 7200;

interface SwedishBrandArchivePageProps {
    params: Promise<{
        locale: string;
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

export async function generateMetadata({ params }: SwedishBrandArchivePageProps): Promise<Metadata> {
    const { locale, slug } = await params;

    // Only 'sv' is allowed
    if (locale !== 'sv') {
        notFound();
    }

    const brand = await getBrandBySlug(slug);

    if (!brand) {
        return {
            title: 'Varumärke hittades inte | Ideal Indiska LIVS',
        };
    }

    const title = `${brand.name} | Autentiska produkter på Ideal Indiska LIVS`;
    const description = brand.description
        ? brand.description.replace(/\<[^>]*>/g, '').substring(0, 150) + " | Handla autentiska produkter på Ideal Indiska LIVS Stockholm."
        : `Handla alla ${brand.name} produkter på Ideal Indiska LIVS. Din pålitliga källa för autentiska indiska och pakistanska livsmedel i Stockholm. Högkvalitativa produkter från ledande varumärken.`;

    const url = `${siteConfig.site_domain}/sv/brand/${slug}`;
    const urlEn = `${siteConfig.site_domain}/brand/${slug}`;

    return {
        title,
        description: description.substring(0, 160),
        openGraph: {
            title,
            description: description.substring(0, 160),
            siteName: 'Ideal Indiska LIVS',
            type: 'website',
            url: url,
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

export default async function SwedishBrandArchivePage({ params, searchParams }: SwedishBrandArchivePageProps) {
    const { locale, slug } = await params;
    const resolvedSearchParams = await searchParams;

    // Only 'sv' is allowed
    if (locale !== 'sv') {
        notFound();
    }

    const brand = await getBrandBySlug(slug);

    if (!brand) {
        notFound();
    }

    const page = Number(resolvedSearchParams.page) || 1;
    const perPage = 20;

    // Get categories and brands for filters
    const [categoriesRaw, brandsData] = await Promise.all([
        getProductCategories(),
        getProductBrands({ hide_empty: true })
    ]);

    // Translate categories to Swedish
    const categories = translateCategories(categoriesRaw, 'sv');

    // Fetch products with brand filter - client-side filtering required
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

    // Filter by brand
    const brandProducts = allProducts.filter(product => {
        if (product.brands?.some((b: any) =>
            b.id === brand.id ||
            b.slug === brand.slug ||
            b.name?.toLowerCase() === brand.name?.toLowerCase()
        )) {
            return true;
        }

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

    // Apply other filters client-side
    let filteredProducts = brandProducts;
    if (resolvedSearchParams.category) {
        filteredProducts = filteredProducts.filter(p => p.categories.some(c => c.slug === resolvedSearchParams.category));
    }
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
    const paginatedProductsRaw = filteredProducts.slice(start, end);

    // Translate products to Swedish
    const paginatedProducts = translateProducts(paginatedProductsRaw, 'sv');

    return (
        <div className="min-h-screen bg-background">
            <ArchiveTemplate
                title={`${brand.name}`}
                description={brand.description || `Bläddra bland alla produkter från ${brand.name}`}
                breadcrumbs={[
                    { label: 'Butik', href: '/sv/shop' },
                    { label: 'Varumärken', href: '/sv/brands' },
                    { label: brand.name }
                ]}
                products={paginatedProducts}
                totalProducts={total}
                currentPage={page}
                totalPages={totalPages}
                basePath={`/sv/brand/${brand.slug}`}
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
                        '@id': `${siteConfig.site_domain}/sv/brand/${brand.slug}`,
                        name: `${brand.name} Produkter`,
                        description: brand.description || `Bläddra bland alla produkter från ${brand.name}`,
                        url: `${siteConfig.site_domain}/sv/brand/${brand.slug}`,
                        inLanguage: 'sv-SE',
                        about: brandSchema(brand.name, {
                            url: `${siteConfig.site_domain}/sv/brand/${brand.slug}`,
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
                                        url: `${siteConfig.site_domain}/sv/product/${product.slug}`,
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
                        { name: 'Hem', url: `${siteConfig.site_domain}/sv/` },
                        { name: 'Butik', url: `${siteConfig.site_domain}/sv/shop` },
                        { name: 'Varumärken', url: `${siteConfig.site_domain}/sv/brands` },
                        { name: brand.name },
                    ]))
                }}
            />
        </div>
    );
}
