import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { PromotionGrid } from "@/components/home/promotion-grid";
import { BannerStrip } from "@/components/home/banner-strip";
import { ProductShowcase } from "@/components/home/product-showcase";
import { getProducts, getProductCategories } from "@/lib/woocommerce";
import type { Metadata } from "next";
import { SchemaScript } from "@/lib/schema/schema-script";
import { idealIndiskaOrganizationSchemaFull } from "@/lib/schema/organization";

// Revalidate page every hour
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ideal Indiska LIVS - Indian & Pakistani Groceries in Stockholm",
  description: "Shop Indian & Pakistani groceries in Stockholm. Premium Basmati rice, spices, halal meat & fresh produce. FREE delivery over 500 SEK. Shop online or visit Bandhagen!",
};

export default async function HomePage() {
  // Fetch data in parallel
  const [categoriesRes, trendingRes, newArrivalsRes, dealsRes] = await Promise.all([
    getProductCategories({ per_page: 6, orderby: 'count', order: 'desc', parent: 0 }),
    getProducts({ per_page: 8, orderby: 'popularity' }),
    getProducts({ per_page: 8, orderby: 'date' }),
    getProducts({ per_page: 8, on_sale: true }),
  ]);

  const categories = categoriesRes || [];
  const trendingProducts = trendingRes.data || [];
  const newProducts = newArrivalsRes.data || [];
  const dealProducts = dealsRes.data || [];

  return (
    <main className="flex min-h-screen flex-col bg-background pb-20 overflow-x-hidden max-w-full">
      {/* 1. Hero Section */}
      <Hero
        title="Authentic Indian & Pakistani Groceries in Stockholm"
        subtitle="From aromatic spices to premium Basmati rice, halal meat to fresh produce - everything you need for authentic South Asian cooking. Delivered to your door in Stockholm."
        badge="Free Delivery Over 500 SEK"
      />

      {/* 2. Top Categories */}
      <CategoryGrid categories={categories} />

      {/* 3. Promotion/Deals Grid */}
      <PromotionGrid />

      {/* 4. Special Offers */}
      <ProductShowcase
        title="Special Offers on Indian & Pakistani Groceries"
        products={dealProducts}
        moreLink="/deals"
      />

      {/* 4. Banner Strip */}
      <BannerStrip />

      {/* 5. Trending Products */}
      <ProductShowcase
        title="Customer Favorites - Most Popular Items"
        products={trendingProducts}
        moreLink="/shop?sort=bestsellers"
      />

      {/* 6. New Arrivals */}
      <ProductShowcase
        title="Fresh Arrivals - New Stock Just In"
        products={newProducts}
        moreLink="/shop?sort=new"
      />

      {/* SEO Structured Data */}
      <SchemaScript
        id="homepage-org-schema"
        schema={idealIndiskaOrganizationSchemaFull()}
      />
    </main>
  );
}
