import { siteConfig } from "@/site.config";

export async function GET() {
    const baseUrl = siteConfig.site_domain;

    const pages = [
        { url: "/delivery-information", priority: 0.9, changefreq: "weekly" },
        { url: "/delivery-goteborg-malmo", priority: 0.8, changefreq: "weekly" },
        { url: "/europe-delivery", priority: 0.8, changefreq: "weekly" },
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
            .map(
                (page) => `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
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
