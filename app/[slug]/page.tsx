import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts, getProductsByCategory, getProductCategoryBySlug } from '@/lib/woocommerce';
import { getPostBySlug, getPageBySlug } from '@/lib/wordpress';
import { ProductTemplate } from '@/components/templates';
import { ArchiveTemplate, PageTemplate, BlogPostTemplate } from '@/components/templates';
import type { Metadata } from 'next';

interface DynamicPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

export async function generateMetadata({ params }: DynamicPageProps): Promise<Metadata> {
  const resolvedParams = await params;

  // Try blog post first (WordPress post at root level like WordPress)
  try {
    const post = await getPostBySlug(resolvedParams.slug);
    if (post) {
      const description = post.excerpt?.rendered?.replace(/<[^>]*>/g, '').trim() || '';
      return {
        title: post.title.rendered,
        description: description.substring(0, 160),
        openGraph: {
          title: post.title.rendered,
          description: description.substring(0, 160),
          type: 'article',
          url: `https://ideallivs.com/${post.slug}`,
        },
      };
    }
  } catch {
    // Continue
  }

  // Try WordPress page
  try {
    const page = await getPageBySlug(resolvedParams.slug);
    if (page) {
      return {
        title: page.title.rendered,
        description: page.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 160) || page.title.rendered,
      };
    }
  } catch {
    // Continue
  }

  // Try product
  try {
    const product = await getProductBySlug(resolvedParams.slug);
    if (product) {
      return {
        title: product.name,
        description: product.short_description?.replace(/<[^>]*>/g, '').substring(0, 160) || product.name,
        openGraph: {
          title: product.name,
          description: product.short_description?.replace(/<[^>]*>/g, '').substring(0, 160),
          images: product.images.map((img) => ({
            url: img.src,
            width: 800,
            height: 800,
            alt: img.alt || product.name,
          })),
        },
      };
    }
  } catch {
    // Continue
  }

  // Try category
  try {
    const category = await getProductCategoryBySlug(resolvedParams.slug);
    if (category) {
      return {
        title: category.name,
        description: category.description || `Browse our ${category.name} products`,
      };
    }
  } catch {
    // Not found
  }

  return {
    title: 'Not Found',
  };
}

export default async function DynamicPage({ params, searchParams }: DynamicPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Try blog post first (WordPress posts at root level - matching WordPress URL structure)
  try {
    const post = await getPostBySlug(resolvedParams.slug);
    if (post) {
      return (
        <BlogPostTemplate post={post as any} />
      );
    }
  } catch {
    // Continue
  }

  // Try WordPress page
  try {
    const page = await getPageBySlug(resolvedParams.slug);
    if (page) {
      const featuredImage = (page as any)._embedded?.['wp:featuredmedia']?.[0]?.source_url
        ? {
          src: (page as any)._embedded['wp:featuredmedia'][0].source_url,
          alt: page.title.rendered,
        }
        : undefined;

      return (
        <PageTemplate
          title={page.title.rendered}
          content={page.content.rendered}
          featuredImage={featuredImage}
          excerpt={page.excerpt?.rendered?.replace(/<[^>]*>/g, '').trim()}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: page.title.rendered }
          ]}
          layout="two-column"
          showHero={true}
        />
      );
    }
  } catch {
    // Continue
  }

  // Try to fetch as product
  try {
    const product = await getProductBySlug(resolvedParams.slug);
    if (product) {
      const relatedProducts = await getRelatedProducts(product.id);

      // Build breadcrumbs
      const breadcrumbs = [
        { label: 'Shop', href: '/shop' },
        ...(product.categories && product.categories.length > 0
          ? [{ label: product.categories[0].name, href: `/product-category/${product.categories[0].slug}` }]
          : []),
        { label: product.name },
      ];

      return (
        <ProductTemplate
          product={product}
          breadcrumbs={breadcrumbs}
          relatedProducts={relatedProducts}
        />
      );
    }
  } catch {
    // Continue
  }

  // Try to fetch as category
  try {
    const category = await getProductCategoryBySlug(resolvedParams.slug);
    if (category) {
      // Render as category page
      const page = Number(resolvedSearchParams.page) || 1;
      const perPage = 12;

      const { data: products, total, totalPages } = await getProductsByCategory(resolvedParams.slug, {
        page,
        per_page: perPage,
        orderby: 'date',
        order: 'desc',
        status: 'publish',
      });

      return (
        <ArchiveTemplate
          title={category.name}
          description={
            category.description ? (
              <div dangerouslySetInnerHTML={{ __html: category.description }} />
            ) : undefined
          }
          breadcrumbs={[
            { label: 'Shop', href: '/shop' },
            { label: category.name },
          ]}
          products={products}
          totalProducts={total}
          currentPage={page}
          totalPages={totalPages}
          basePath={`/product-category/${resolvedParams.slug}`}
          gridColumns={5}
        />
      );
    }
  } catch {
    // Not found
  }

  notFound();
}
