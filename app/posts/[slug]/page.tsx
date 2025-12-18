import {
  getPostBySlug,
  getFeaturedMediaById,
  getAuthorById,
  getCategoryById,
} from "@/lib/wordpress";

import { Section, Container, Article, Prose } from "@/components/craft";
import { badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/site.config";

import Link from "next/link";
import Balancer from "react-wrap-balancer";

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
  const post = await getPostBySlug(slug);

  if (!post) {
    return {};
  }

  const ogUrl = new URL(`${siteConfig.site_domain}/api/og`);
  ogUrl.searchParams.append("title", post.title.rendered);
  // Strip HTML tags for description
  const description = post.excerpt.rendered.replace(/<[^>]*>/g, "").trim();
  ogUrl.searchParams.append("description", description);

  return {
    title: post.title.rendered,
    description: description,
    openGraph: {
      title: post.title.rendered,
      description: description,
      type: "article",
      url: `${siteConfig.site_domain}/posts/${post.slug}`,
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: post.title.rendered,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title.rendered,
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
  const post = await getPostBySlug(slug);

  if (!post) {
    return <div>Post not found</div>;
  }

  // Safe fetch for featured media
  let featuredMedia = null;
  if (post.featured_media) {
    try {
      featuredMedia = await getFeaturedMediaById(post.featured_media);
    } catch (e) {
      console.error(`Failed to fetch media ${post.featured_media} for post ${slug}`, e);
    }
  }

  // Safe fetch for author
  let author = null;
  if (post.author) {
    try {
      author = await getAuthorById(post.author);
    } catch (e) {
      console.warn(`Failed to fetch author ${post.author} for post ${slug}`, e);
      // Fallback author
      author = { id: 0, name: 'Anmol Sweets', slug: 'anmol-sweets', url: '', description: '', link: '', avatar_urls: {} } as any;
    }
  }

  const date = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Safe fetch for category
  let category = null;
  if (post.categories && post.categories.length > 0) {
    try {
      category = await getCategoryById(post.categories[0]);
    } catch (e) {
      console.warn(`Failed to fetch category ${post.categories[0]} for post ${slug}`, e);
    }
  }

  return (
    <Section>
      <Container>
        <Prose>
          <h1>
            <Balancer>
              <span
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              ></span>
            </Balancer>
          </h1>
          <div className="flex justify-between items-center gap-4 text-sm mb-4">
            <h5>
              Published {date}
              {author && author.name && (
                <>
                  {" "}by{" "}
                  <span>
                    <a href={`/posts/?author=${author.id}`}>{author.name}</a>{" "}
                  </span>
                </>
              )}
            </h5>

            {category && (
              <Link
                href={`/posts/?category=${category.id}`}
                className={cn(
                  badgeVariants({ variant: "outline" }),
                  "!no-underline"
                )}
              >
                {category.name}
              </Link>
            )}
          </div>
          {featuredMedia?.source_url && (
            <div className="h-96 my-12 md:h-[500px] overflow-hidden flex items-center justify-center border rounded-lg bg-accent/25">
              {/* eslint-disable-next-line */}
              <img
                className="w-full h-full object-cover"
                src={featuredMedia.source_url}
                alt={post.title.rendered}
              />
            </div>
          )}
        </Prose>

        <Article dangerouslySetInnerHTML={{ __html: post.content.rendered }} />
      </Container>
    </Section>
  );
}
