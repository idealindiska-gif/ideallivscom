import { notFound } from 'next/navigation';
import { getPostBySlug, getPageBySlug } from '@/lib/wordpress';
import { transformPost } from '@/lib/wordpress-transform';
import { PageTemplate, BlogPostTemplate } from '@/components/templates';
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
      const decodedTitle = post.title.rendered.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
      const description = post.excerpt?.rendered?.replace(/<[^>]*>/g, '').trim() || '';
      return {
        title: `${decodedTitle} | Ideal Indiska LIVS Blog`,
        description: description.substring(0, 160),
        openGraph: {
          title: decodedTitle,
          description: description.substring(0, 160),
          type: 'article',
          url: `https://www.ideallivs.com/${post.slug}`,
          siteName: 'Ideal Indiska LIVS',
        },
        alternates: {
          canonical: `https://www.ideallivs.com/${post.slug}`,
        }
      };
    }
  } catch {
    // Continue
  }

  // Try WordPress page
  try {
    const page = await getPageBySlug(resolvedParams.slug);
    if (page) {
      const decodedTitle = page.title.rendered.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
      const description = page.excerpt?.rendered?.replace(/<[^>]*>/g, '').substring(0, 160) || page.title.rendered;
      return {
        title: `${decodedTitle} | Ideal Indiska LIVS`,
        description: description,
        openGraph: {
          title: decodedTitle,
          description: description,
          type: 'website',
          url: `https://www.ideallivs.com/${page.slug}`,
          siteName: 'Ideal Indiska LIVS',
        },
        alternates: {
          canonical: `https://www.ideallivs.com/${page.slug}`,
        },
        twitter: {
          card: 'summary_large_image',
          title: decodedTitle,
          description: description,
        }
      };
    }
  } catch {
    // Continue
  }

  return {
    title: 'Not Found | Ideal Indiska LIVS',
  };
}

export default async function DynamicPage({ params, searchParams }: DynamicPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Try blog post first (WordPress posts at root level - matching WordPress URL structure)
  try {
    const wpPost = await getPostBySlug(resolvedParams.slug);
    if (wpPost) {
      // Transform WordPress API post to match BlogPostTemplate's expected format
      const transformedPost = transformPost(wpPost);
      return (
        <BlogPostTemplate post={transformedPost} />
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

  notFound();
}
