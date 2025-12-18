import { siteConfig } from "@/site.config";
import { getProducts } from "@/lib/woocommerce/products-direct";
import { getAllPosts } from "@/lib/wordpress";

export async function GET() {
    const baseUrl = siteConfig.site_domain;

    // Fetch products and posts in parallel
    const [productsRes, posts] = await Promise.all([
        getProducts({ per_page: 100, status: 'publish' }),
        getAllPosts()
    ]);

    const products = productsRes.data;

    const productImages = products
        .filter(p => p.images && p.images.length > 0)
        .map(p => `
  <url>
    <loc>${baseUrl}/product/${p.slug}</loc>
    <image:image>
      <image:loc>${p.images[0].src}</image:loc>
      <image:title>${p.name}</image:title>
    </image:image>
  </url>`).join("");

    const postImages = posts
        .filter(p => (p as any)._embedded?.['wp:featuredmedia']?.[0]?.source_url)
        .map(p => `
  <url>
    <loc>${baseUrl}/${p.slug}</loc>
    <image:image>
      <image:loc>${(p as any)._embedded['wp:featuredmedia'][0].source_url}</image:loc>
      <image:title>${p.title.rendered}</image:title>
    </image:image>
  </url>`).join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${productImages}
  ${postImages}
</urlset>`;

    return new Response(sitemap, {
        headers: {
            "Content-Type": "application/xml",
        },
    });
}
