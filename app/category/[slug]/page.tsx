import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getCategoryBySlug, getPostsByCategoryPaginated } from '@/lib/wordpress';
import type { Metadata } from 'next';

interface CategoryPageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const resolvedParams = await params;

    try {
        const category = await getCategoryBySlug(resolvedParams.slug);

        if (!category) {
            return {
                title: 'Category Not Found | Ideal Indiska LIVS Blog',
            };
        }

        const title = `${category.name} | Ideal Indiska LIVS Blog - Recipes & Guides`;
        const description = (category.description || `Read guides, recipes, and more about ${category.name} at Ideal Indiska LIVS.`) + " Learn about authentic South Asian ingredients and culture.";

        return {
            title,
            description: description.substring(0, 160),
            openGraph: {
                title,
                description: description.substring(0, 160),
                url: `https://ideallivs.com/category/${resolvedParams.slug}`,
                siteName: 'Ideal Indiska LIVS Blog',
                type: 'website',
            },
            alternates: {
                canonical: `/category/${resolvedParams.slug}`,
            },
        };
    } catch {
        return {
            title: 'Category Not Found | Ideal Indiska LIVS Blog',
        };
    }
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    let category;
    try {
        category = await getCategoryBySlug(resolvedParams.slug);
    } catch (error) {
        notFound();
    }

    if (!category) {
        notFound();
    }

    // Fetch posts for this category
    const page = parseInt(resolvedSearchParams.page as string) || 1;
    const { data: posts, headers } = await getPostsByCategoryPaginated(category.id, page, 12);

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Category Header */}
            <div className="mb-12">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Link href="/blog" className="hover:text-primary">Blog</Link>
                    <span>/</span>
                    <span>Category</span>
                </div>
                <h1 className="text-4xl font-heading font-bold mb-4">{category.name}</h1>
                {category.description && (
                    <p className="text-lg text-muted-foreground max-w-3xl">
                        {category.description}
                    </p>
                )}
            </div>

            {/* Posts Grid */}
            {posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post: any) => (
                        <Link
                            key={post.id}
                            href={`/${post.slug}`}
                            className="group block border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all"
                        >
                            {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                                <div className="aspect-video relative bg-muted">
                                    <Image
                                        src={post._embedded['wp:featuredmedia'][0].source_url}
                                        alt={post.title.rendered}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                            )}
                            <div className="p-6">
                                <h3
                                    className="font-heading font-semibold text-xl mb-2 line-clamp-2"
                                    dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                                />
                                <div
                                    className="text-muted-foreground text-sm line-clamp-3"
                                    dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                                />
                                <p className="text-primary text-sm mt-4 font-semibold">Read more →</p>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No articles found in this category yet.</p>
                </div>
            )}

            {/* Pagination */}
            {headers.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                    {Array.from({ length: headers.totalPages }, (_, i) => i + 1).map((pageNum) => (
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

            {/* Navigation */}
            <div className="mt-12">
                <Link
                    href="/blog"
                    className="inline-flex items-center text-primary hover:underline"
                >
                    ← Back to all articles
                </Link>
            </div>
        </div>
    );
}
