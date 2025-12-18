import { getPageBySlug } from "@/lib/wordpress";
import { PageTemplate } from "@/components/templates";
import { siteConfig } from "@/site.config";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

// Make this route dynamic to prevent build failures when WordPress API is unavailable
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    return {};
  }

  const ogUrl = new URL(`${siteConfig.site_domain}/api/og`);
  ogUrl.searchParams.append("title", page.title.rendered);
  // Strip HTML tags for description and limit length
  const description = page.excerpt?.rendered
    ? page.excerpt.rendered.replace(/<[^>]*>/g, "").trim()
    : page.content.rendered
      .replace(/<[^>]*>/g, "")
      .trim()
      .slice(0, 200) + "...";
  ogUrl.searchParams.append("description", description);

  return {
    title: page.title.rendered,
    description: description,
    openGraph: {
      title: page.title.rendered,
      description: description,
      type: "article",
      url: `${siteConfig.site_domain}/pages/${page.slug}`,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: page.title.rendered,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.title.rendered,
      description: description,
      images: [ogUrl.toString()],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  // Extract featured image if available from _embedded data
  const featuredImage = (page as any)._embedded?.['wp:featuredmedia']?.[0]?.source_url
    ? {
      src: (page as any)._embedded['wp:featuredmedia'][0].source_url,
      alt: page.title.rendered,
    }
    : undefined;

  // Extract excerpt
  const excerpt = page.excerpt?.rendered
    ? page.excerpt.rendered.replace(/<[^>]*>/g, "").trim()
    : undefined;

  return (
    <PageTemplate
      title={page.title.rendered}
      content={page.content.rendered}
      featuredImage={featuredImage}
      excerpt={excerpt}
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: page.title.rendered }
      ]}
      layout="two-column"
      showHero={true}
    />
  );
}
