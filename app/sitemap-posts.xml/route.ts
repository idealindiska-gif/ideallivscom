import { siteConfig } from "@/site.config";
import { getAllPosts } from "@/lib/wordpress";

export async function GET() {
    const baseUrl = siteConfig.site_domain;

    const posts = await getAllPosts();

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${posts
            .map(
                (post) => `
  <url>
    <loc>${baseUrl}/${post.slug}</loc>
    <lastmod>${new Date(post.modified).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
            )
            .join("")}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
