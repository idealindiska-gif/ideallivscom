import { siteConfig } from "@/site.config";
import { getProducts } from "@/lib/woocommerce/products-direct";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ page: string }> }
) {
    const baseUrl = siteConfig.site_domain;
    const resolvedParams = await params;

    const page = parseInt(resolvedParams.page);

    if (isNaN(page) || page < 1) {
        return new NextResponse("Invalid sitemap page", { status: 404 });
    }

    try {
        const productsRes = await getProducts({
            per_page: 100,
            page: page,
            status: "publish",
        });

        const products = productsRes.data;

        if (products.length === 0) {
            return new NextResponse("No products found for this page", { status: 404 });
        }

        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${products
                .map(
                    (product) => `  <url>
    <loc>${baseUrl}/product/${product.slug}</loc>
    <lastmod>${new Date(product.date_modified || product.date_created || new Date()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
                )
                .join("\n")}
</urlset>`;

        return new NextResponse(sitemap, {
            headers: {
                "Content-Type": "application/xml",
                "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
        });
    } catch (error) {
        console.error("Error generating product sitemap:", error);
        return new NextResponse("Error generating sitemap", { status: 500 });
    }
}
