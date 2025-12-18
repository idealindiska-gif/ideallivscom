import { siteConfig } from "@/site.config";
import { getProductBrands } from "@/lib/woocommerce/brands";

export async function GET() {
    const baseUrl = siteConfig.site_domain;

    const brands = await getProductBrands();

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${brands
            .map(
                (brand) => `
  <url>
    <loc>${baseUrl}/brand/${brand.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
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
