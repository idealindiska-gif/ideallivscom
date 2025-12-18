import { siteConfig } from "@/site.config";

export async function GET() {
    const baseUrl = siteConfig.site_domain;

    const pages = [
        { url: "", priority: 1.0, changefreq: "daily" },
        { url: "/about", priority: 0.8, changefreq: "monthly" },
        { url: "/contact", priority: 0.8, changefreq: "monthly" },
        { url: "/faq", priority: 0.7, changefreq: "monthly" },
        { url: "/privacy-policy", priority: 0.3, changefreq: "yearly" },
        { url: "/refund-return", priority: 0.3, changefreq: "yearly" },
        { url: "/terms-conditions", priority: 0.3, changefreq: "yearly" },
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
