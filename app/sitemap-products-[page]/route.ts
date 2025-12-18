import { siteConfig } from "@/site.config";
import { getProducts } from "@/lib/woocommerce/products-direct";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ page: string }> }
) {
    const baseUrl = siteConfig.site_domain;
    const resolvedParams = await params;

    // Extract page number from "1.xml" or just "1"
    const pageStr = resolvedParams.page.replace(".xml", "");
    const page = parseInt(pageStr);

    if (isNaN(page)) {
        return new Response("Invalid sitemap page", { status: 404 });
    }

    const productsRes = await getProducts({
        per_page: 200,
        page: page,
        status: 'publish'
    });

    const products = productsRes.data;

    if (products.length === 0 && page > 1) {
        return new Response("No products found for this page", { status: 404 });
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${products
            .map(
                (product) => `
  <url>
    <loc>${baseUrl}/product/${product.slug}</loc>
    <lastmod>${new Date(product.date_modified || product.date_created || new Date()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
