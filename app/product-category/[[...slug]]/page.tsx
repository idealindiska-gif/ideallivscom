import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductCategoryBySlug, getProducts } from '@/lib/woocommerce';
import { wooCategorySchema, breadcrumbSchema, categoryBreadcrumbs } from '@/lib/schema';
import { siteConfig } from '@/site.config';
import type { Metadata } from 'next';

interface ProductCategoryPageProps {
    params: Promise<{
        slug?: string[];
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: ProductCategoryPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const slug = resolvedParams.slug?.[resolvedParams.slug.length - 1] || '';

    try {
        const category = await getProductCategoryBySlug(slug);

        if (!category) {
            return {
                title: 'Category Not Found',
            };
        }

        return {
            title: `${category.name} | Ideal Indiska LIVS`,
            description: category.description?.replace(/\<[^>]*>/g, '').substring(0, 160) || `Shop ${category.name} products at Ideal Indiska LIVS`,
            openGraph: {
                title: category.name,
                description: category.description?.replace(/\<[^>]*>/g, '').substring(0, 160),
                ...(category.image && {
                    images: [{
                        url: category.image.src,
                        width: 800,
                        height: 800,
                        alt: category.name,
                    }],
                }),
                url: `https://ideallivs.com/product-category/${resolvedParams.slug?.join('/')}`,
            },
        };
    } catch {
        return {
            title: 'Category Not Found',
        };
    }
}

export default async function ProductCategoryPage({ params, searchParams }: ProductCategoryPageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    // Get the last segment as the category slug
    const categorySlug = resolvedParams.slug?.[resolvedParams.slug.length - 1] || '';

    let category;
    try {
        category = await getProductCategoryBySlug(categorySlug);
    } catch (error) {
        notFound();
    }

    if (!category) {
        notFound();
    }

    // Fetch products for this category
    const page = parseInt(resolvedSearchParams.page as string) || 1;
    const perPage = 12;

    const { data: products, total, totalPages } = await getProducts({
        category: category.id.toString(),
        page,
        per_page: perPage,
    });

    // Build breadcrumbs from slug array
    const breadcrumbs = [
        { label: 'Shop', href: '/shop' },
    ];

    // Add intermediate categories if nested
    if (resolvedParams.slug && resolvedParams.slug.length > 1) {
        resolvedParams.slug.slice(0, -1).forEach((slug, index) => {
            const path = resolvedParams.slug!.slice(0, index + 1).join('/');
            breadcrumbs.push({
                label: slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                href: `/product-category/${path}`
            });
        });
    }

    // Add current category
    breadcrumbs.push({ label: category.name, href: '' });

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                {breadcrumbs.map((crumb, index) => (
                    <div key={index} className="flex items-center gap-2">
                        {index > 0 && <span>/</span>}
                        {crumb.href ? (
                            <Link href={crumb.href} className="hover:text-primary">
                                {crumb.label}
                            </Link>
                        ) : (
                            <span className="text-foreground font-medium">{crumb.label}</span>
                        )}
                    </div>
                ))}
            </nav>

            {/* Category Header */}
            <div className="mb-12">
                <h1 className="text-4xl font-heading font-bold mb-4">{category.name}</h1>
                {category.description && (
                    <div
                        className="text-lg text-muted-foreground max-w-3xl prose"
                        dangerouslySetInnerHTML={{ __html: category.description }}
                    />
                )}
            </div>

            {/* Products Grid */}
            {products && products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/product/${product.slug}`}
                            className="group block border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all"
                        >
                            {product.images && product.images[0] && (
                                <div className="aspect-square relative bg-muted">
                                    <Image
                                        src={product.images[0].src}
                                        alt={product.name}
                                        fill
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        unoptimized
                                    />
                                </div>
                            )}
                            <div className="p-4">
                                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                                <p className="text-primary font-bold">{product.price} SEK</p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No products found in this category.</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <Link
                            key={pageNum}
                            href={`?page=${pageNum}`}
                            className={`px-4 py-2 rounded ${pageNum === page
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                                }`}
                        >
                            {pageNum}
                        </Link>
                    ))}
                </div>
            )}

            {/* SEO Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(wooCategorySchema(category, products, {
                        baseUrl: siteConfig.site_domain,
                        websiteId: `${siteConfig.site_domain}/#website`,
                    }))
                }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema(
                        categoryBreadcrumbs(
                            { name: category.name },
                            siteConfig.site_domain
                        )
                    ))
                }}
            />
        </div>
    );
}
