import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getProductCategoryBySlug, getProducts, getProductCategories } from '@/lib/woocommerce';
import { getProductBrands } from '@/lib/woocommerce/brands';
import { translateCategory, translateProducts, translateCategories } from '@/lib/translations';
import { ArchiveTemplate } from '@/components/templates';
import { ShopTopBar } from '@/components/shop/shop-top-bar';
import { BreadcrumbItem } from '@/components/layout/breadcrumbs';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { wooCategorySchema, breadcrumbSchema } from '@/lib/schema';
import { siteConfig } from '@/site.config';

// ISR: Revalidate category pages every 2 hours
export const revalidate = 7200;

interface SwedishProductCategoryPageProps {
    params: Promise<{
        locale: string;
        slug?: string[];
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: SwedishProductCategoryPageProps): Promise<Metadata> {
    const { locale, slug } = await params;

    // Only 'sv' is allowed
    if (locale !== 'sv') {
        notFound();
    }

    const categorySlug = slug?.[slug.length - 1] || '';

    try {
        const category = await getProductCategoryBySlug(categorySlug);

        if (!category) {
            return {
                title: 'Kategorin hittades inte',
            };
        }

        // Translate category to Swedish
        const translatedCategory = translateCategory(category, 'sv');

        const defaultImage = {
            url: 'https://crm.ideallivs.com/wp-content/uploads/2025/07/rice-and-flours-e1752149384409.jpg',
            width: 1200,
            height: 630,
            alt: 'Ideal Indiska LIVS - Indiska och pakistanska livsmedel i Stockholm',
        };

        const cleanDescription = translatedCategory.description?.replace(/\<[^>]*>/g, '').trim();
        const metaDescription = cleanDescription
            ? cleanDescription.substring(0, 150) + " | Autentiska indiska och pakistanska livsmedel på Ideal Indiska LIVS. Leverans samma dag i Stockholm."
            : `Handla ${translatedCategory.name} på Ideal Indiska LIVS. Din pålitliga källa för autentiska indiska och pakistanska livsmedel i Stockholm. Högkvalitativa produkter till bra priser.`;

        const url = `${siteConfig.site_domain}/sv/product-category/${slug?.join('/')}`;
        const urlEn = `${siteConfig.site_domain}/product-category/${slug?.join('/')}`;

        return {
            title: `${translatedCategory.name} | Ideal Indiska LIVS`,
            description: metaDescription.substring(0, 160),
            openGraph: {
                title: `${translatedCategory.name} | Ideal Indiska LIVS`,
                description: metaDescription.substring(0, 160),
                images: translatedCategory.image
                    ? [{
                        url: translatedCategory.image.src,
                        width: 800,
                        height: 800,
                        alt: translatedCategory.name,
                    }]
                    : [defaultImage],
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
    } catch {
        return {
            title: 'Kategorin hittades inte | Ideal Indiska LIVS',
        };
    }
}

export default async function SwedishProductCategoryPage({ params, searchParams }: SwedishProductCategoryPageProps) {
    const { locale, slug } = await params;
    const resolvedSearchParams = await searchParams;

    // Only 'sv' is allowed
    if (locale !== 'sv') {
        notFound();
    }

    // Get the last segment as the category slug
    const categorySlug = slug?.[slug.length - 1] || '';

    let category;
    try {
        category = await getProductCategoryBySlug(categorySlug);
    } catch (error) {
        notFound();
    }

    if (!category) {
        notFound();
    }

    // Translate category to Swedish
    const translatedCategory = translateCategory(category, 'sv');

    // Fetch categories and brands for filters
    const [categoriesRaw, brandsData] = await Promise.all([
        getProductCategories(),
        getProductBrands({ hide_empty: true })
    ]);

    const categories = translateCategories(categoriesRaw, 'sv');

    // Fetch products for this category
    const page = parseInt(resolvedSearchParams.page as string) || 1;
    const perPage = 20;

    const { data: productsRaw, total, totalPages } = await getProducts({
        category: category.id.toString(),
        page,
        per_page: perPage,
        orderby: (resolvedSearchParams.orderby as any) || 'date',
        order: (resolvedSearchParams.order as 'asc' | 'desc') || 'desc',
        min_price: resolvedSearchParams.min_price as string,
        max_price: resolvedSearchParams.max_price as string,
        brand: resolvedSearchParams.brand as string,
    });

    const products = translateProducts(productsRaw, 'sv');

    // Build breadcrumbs from slug array (Swedish)
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Butik', href: '/sv/shop' },
    ];

    // Add intermediate categories if nested
    if (slug && slug.length > 1) {
        slug.slice(0, -1).forEach((s, index) => {
            const path = slug!.slice(0, index + 1).join('/');
            breadcrumbs.push({
                label: s.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                href: `/sv/product-category/${path}`
            });
        });
    }

    // Add current category
    breadcrumbs.push({ label: translatedCategory.name });

    return (
        <>
            <ArchiveTemplate
                title={translatedCategory.name}
                description={translatedCategory.description}
                breadcrumbs={breadcrumbs}
                products={products}
                totalProducts={total}
                currentPage={page}
                totalPages={totalPages}
                basePath={`/sv/product-category/${slug?.join('/')}`}
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
                    __html: JSON.stringify(wooCategorySchema(translatedCategory, products, {
                        baseUrl: `${siteConfig.site_domain}/sv`,
                        websiteId: `${siteConfig.site_domain}/#website`,
                    }))
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema(
                        [
                            { name: 'Hem', url: `${siteConfig.site_domain}/sv/` },
                            { name: 'Butik', url: `${siteConfig.site_domain}/sv/shop` },
                            ...breadcrumbs.slice(1).map(b => ({
                                name: b.label,
                                url: b.href ? `${siteConfig.site_domain}${b.href}` : undefined
                            }))
                        ]
                    ))
                }}
            />
        </>
    );
}
