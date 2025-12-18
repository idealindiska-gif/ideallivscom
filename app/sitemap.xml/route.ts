import { siteConfig } from "@/site.config";
import { getProducts } from "@/lib/woocommerce/products-direct";

export async function GET() {
    const baseUrl = siteConfig.site_domain;

    // Fetch products to calculate how many product sitemaps we need
    const productsRes = await getProducts({ per_page: 1 });
    const totalProducts = productsRes.total;
    const productSitemapCount = Math.ceil(totalProducts / 200);

    const sitemaps = [
        `${baseUrl}/sitemap-pages.xml`,
        `${baseUrl}/sitemap-delivery.xml`,
        `${baseUrl}/sitemap-posts.xml`,
        `${baseUrl}/sitemap-post-categories.xml`,
        `${baseUrl}/sitemap-product-categories.xml`,
        `${baseUrl}/sitemap-product-brands.xml`,
        `${baseUrl}/sitemap-images.xml`,
    ];

    // Add paginated product sitemaps
    for (let i = 1; i <= productSitemapCount; i++) {
        sitemaps.push(`${baseUrl}/sitemap-products-${i}.xml`);
    }

    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps
            .map(
                (url) => `
  <sitemap>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`
            )
            .join("")}
</sitemapindex>`;

    return new Response(sitemapIndex, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
