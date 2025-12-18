import { siteConfig } from "@/site.config";
import { getProductCategories } from "@/lib/woocommerce/products-direct";

export async function GET() {
    const baseUrl = siteConfig.site_domain;

    const categories = await getProductCategories();

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${categories
            .map(
                (cat) => `
  <url>
    <loc>${baseUrl}/product-category/${cat.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
