import { MetadataRoute } from "next";
import { siteConfig } from "@/site.config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let posts: any[] = [];

  // Only try to fetch posts if WordPress is configured
  if (process.env.NEXT_PUBLIC_WORDPRESS_URL) {
    try {
      const { getAllPosts } = await import("@/lib/wordpress");
      posts = await getAllPosts();
    } catch (error) {
      console.error('Failed to fetch posts for sitemap:', error);
      // Return static URLs if WordPress is unreachable during build
    }
  }

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${siteConfig.site_domain}`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 1,
    },
    {
      url: `${siteConfig.site_domain}/posts`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${siteConfig.site_domain}/pages`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.site_domain}/authors`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.site_domain}/categories`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteConfig.site_domain}/tags`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const postUrls: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.site_domain}/posts/${post.slug}`,
    lastModified: new Date(post.modified),
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticUrls, ...postUrls];
}
