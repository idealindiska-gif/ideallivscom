import { notFound } from 'next/navigation';
import { getPostBySlug, getPageBySlug } from '@/lib/wordpress';
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

  notFound();
}
