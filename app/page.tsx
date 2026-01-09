import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { PromotionGrid } from "@/components/home/promotion-grid";
import { BannerStrip } from "@/components/home/banner-strip";
import { ProductShowcase } from "@/components/home/product-showcase";
import { Features } from "@/components/home/features";
import { SeoContent } from "@/components/home/seo-content";
import { getProducts, getProductCategories } from "@/lib/woocommerce";
import type { Metadata } from "next";
import { SchemaScript } from "@/lib/schema/schema-script";
import { idealIndiskaOrganizationSchemaFull } from "@/lib/schema/organization";

// Revalidate page every hour
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ideal Indiska LIVS | Authentic Indian & Pakistani Groceries Stockholm",
  description: "Stockholm's best Indian & Pakistani grocery store. Shop premium Basmati rice, aromatic spices, Halal meat, and fresh produce. Fast delivery in Stockholm & Europe-wide.",
  alternates: {
    canonical: "https://www.ideallivs.com",
  },
  openGraph: {
    title: "Ideal Indiska LIVS - Indian & Pakistani Groceries in Stockholm",
    description: "Your trusted source for authentic Indian and Pakistani groceries in Stockholm. Fresh produce, aromatic spices, premium Basmati rice, and halal meat delivered to your door.",
    url: "https://www.ideallivs.com",
    siteName: "Ideal Indiska LIVS",
    images: [
      {
        url: "https://crm.ideallivs.com/wp-content/uploads/2025/08/delivery-cover-post.png",
        width: 1200,
        height: 630,
        alt: "Ideal Indiska LIVS Store - Indian & Pakistani Groceries",
      },
    ],
    locale: "sv_SE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ideal Indiska LIVS - Indian & Pakistani Groceries in Stockholm",
    description: "Your trusted source for authentic Indian and Pakistani groceries in Stockholm. Fresh produce, aromatic spices, premium Basmati rice, and halal meat delivered to your door.",
    images: ["https://crm.ideallivs.com/wp-content/uploads/2025/08/delivery-cover-post.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function HomePage() {
  // Fetch data in parallel
  const [categoriesRes, trendingRes, newArrivalsRes, dealsRes, haldiramRes, freshProduceRes] = await Promise.all([
    getProductCategories({ per_page: 6, orderby: 'count', order: 'desc', parent: 0 }),
    getProducts({ per_page: 8, orderby: 'popularity' }),
    getProducts({ per_page: 8, orderby: 'date' }),
    getProducts({ per_page: 8, on_sale: true }),
    getProducts({ per_page: 8, brand: 'haldiram' }),
    getProducts({ per_page: 8, category: 'fresh-produce' }),
  ]);

  const categories = categoriesRes || [];
  const trendingProducts = trendingRes.data || [];
  const newProducts = newArrivalsRes.data || [];
  const dealProducts = dealsRes.data || [];
  const haldiramProducts = haldiramRes?.data || [];
  const freshProduceProducts = freshProduceRes?.data || [];


  return (
    <main className="flex min-h-screen flex-col bg-background pb-20 overflow-x-hidden max-w-full">
      {/* 1. Hero Section */}
      <Hero
        title="Authentic Indian & Pakistani Groceries in Stockholm"
        subtitle="From aromatic spices to premium Basmati rice, halal meat to fresh produce - everything you need for authentic South Asian cooking. Delivered to your door in Stockholm."
        badge="Free Delivery Over 500 SEK"
      />

      {/* 2. Features/Benefits Section (NEW) */}
      <Features />

      {/* 3. Top Categories */}
      <CategoryGrid categories={categories} />

      {/* 4. Promotion/Deals Grid */}
      <PromotionGrid />

      {/* 5. Special Offers */}
      <ProductShowcase
        title="Special Offers on Indian & Pakistani Groceries"
        products={dealProducts}
        moreLink="/deals"
      />

      {/* 6. Banner Strip */}
      <BannerStrip />

      {/* 7. Trending Products */}
      <ProductShowcase
        title="Customer Favorites - Most Popular Items"
        products={trendingProducts}
        moreLink="/shop?sort=bestsellers"
      />

      {/* 8. Haldiram Section */}
      <ProductShowcase
        title="Haldiram's - Authentic Indian Snacks"
        products={haldiramProducts}
        moreLink="/brand/haldiram"
      />

      {/* 9. New Arrivals */}
      <ProductShowcase
        title="Fresh Arrivals - New Stock Just In"
        products={newProducts}
        moreLink="/shop?sort=new"
      />

      {/* 10. Fresh Produce Section */}
      <ProductShowcase
        title="Fresh Produce - Fruits & Vegetables"
        products={freshProduceProducts}
        moreLink="/product-category/fresh-produce"
      />

      {/* 11. SEO & Brand Content (NEW) */}
      <SeoContent />

      {/* SEO Structured Data */}
      <SchemaScript
        id="homepage-org-schema"
        schema={idealIndiskaOrganizationSchemaFull()}
      />
    </main>
  );
}
