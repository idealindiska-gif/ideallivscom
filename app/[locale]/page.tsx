import { Hero } from "@/components/home/hero";
import { CategoryGrid } from "@/components/home/category-grid";
import { PromotionGrid } from "@/components/home/promotion-grid";
import { BannerStrip } from "@/components/home/banner-strip";
import { ProductShowcase } from "@/components/home/product-showcase";
import { Features } from "@/components/home/features";
import { SeoContent } from "@/components/home/seo-content";
import { getProducts, getProductCategories } from "@/lib/woocommerce";
import { translateCategories, translateProducts } from "@/lib/translations";
import type { Metadata } from "next";
import { SchemaScript } from "@/lib/schema/schema-script";
import { idealIndiskaOrganizationSchemaFull } from "@/lib/schema/organization";

// Revalidate page every hour
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Ideal Indiska LIVS | Autentiska indiska och pakistanska livsmedel Stockholm",
  description: "Stockholms bästa indiska och pakistanska mataffär. Handla premium Basmati-ris, aromatiska kryddor, Halal-kött och färska produkter. Snabb leverans i Stockholm och Europa.",
  alternates: {
    canonical: "https://www.ideallivs.com/sv/",
    languages: {
      'en': 'https://www.ideallivs.com',
      'sv': 'https://www.ideallivs.com/sv/',
      'x-default': 'https://www.ideallivs.com',
    },
  },
  openGraph: {
    title: "Ideal Indiska LIVS - Indiska och pakistanska livsmedel i Stockholm",
    description: "Din pålitliga källa för autentiska indiska och pakistanska livsmedel i Stockholm. Färska produkter, aromatiska kryddor, premium Basmati-ris och halal-kött levererat till din dörr.",
    url: "https://www.ideallivs.com/sv/",
    siteName: "Ideal Indiska LIVS",
    images: [
      {
        url: "https://crm.ideallivs.com/wp-content/uploads/2025/08/delivery-cover-post.png",
        width: 1200,
        height: 630,
        alt: "Ideal Indiska LIVS Butik - Indiska och pakistanska livsmedel",
      },
    ],
    locale: "sv_SE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ideal Indiska LIVS - Indiska och pakistanska livsmedel i Stockholm",
    description: "Din pålitliga källa för autentiska indiska och pakistanska livsmedel i Stockholm. Färska produkter, aromatiska kryddor, premium Basmati-ris och halal-kött levererat till din dörr.",
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

export default async function SwedishHomePage() {
  // Fetch data in parallel
  const [categoriesRes, trendingRes, newArrivalsRes, dealsRes, haldiramRes, freshProduceRes] = await Promise.all([
    getProductCategories({ per_page: 6, orderby: 'count', order: 'desc', parent: 0 }),
    getProducts({ per_page: 8, orderby: 'popularity' }),
    getProducts({ per_page: 8, orderby: 'date' }),
    getProducts({ per_page: 8, on_sale: true }),
    getProducts({ per_page: 8, brand: 'haldiram' }),
    getProducts({ per_page: 8, category: 'fresh-produce' }),
  ]);

  // Translate to Swedish
  const categories = translateCategories(categoriesRes || [], 'sv');
  const trendingProducts = translateProducts(trendingRes.data || [], 'sv');
  const newProducts = translateProducts(newArrivalsRes.data || [], 'sv');
  const dealProducts = translateProducts(dealsRes.data || [], 'sv');
  const haldiramProducts = translateProducts(haldiramRes?.data || [], 'sv');
  const freshProduceProducts = translateProducts(freshProduceRes?.data || [], 'sv');

  return (
    <main className="flex min-h-screen flex-col bg-background pb-20 overflow-x-hidden max-w-full">
      {/* 1. Hero Section */}
      <Hero
        title="Autentiska indiska och pakistanska livsmedel i Stockholm"
        subtitle="Från aromatiska kryddor till premium Basmati-ris, halal-kött till färska produkter - allt du behöver för autentisk sydasiatisk matlagning. Levererat till din dörr i Stockholm."
        badge="Fri frakt över 500 SEK"
      />

      {/* 2. Features/Benefits Section */}
      <Features />

      {/* 3. Top Categories */}
      <CategoryGrid categories={categories} />

      {/* 4. Promotion/Deals Grid */}
      <PromotionGrid />

      {/* 5. Special Offers */}
      <ProductShowcase
        title="Specialerbjudanden på indiska och pakistanska livsmedel"
        products={dealProducts}
        moreLink="/sv/deals"
      />

      {/* 6. Banner Strip */}
      <BannerStrip />

      {/* 7. Trending Products */}
      <ProductShowcase
        title="Kundfavoriter - Mest populära produkter"
        products={trendingProducts}
        moreLink="/sv/shop?sort=bestsellers"
      />

      {/* 8. Haldiram Section */}
      <ProductShowcase
        title="Haldiram's - Autentiska indiska snacks"
        products={haldiramProducts}
        moreLink="/sv/brand/haldiram"
      />

      {/* 9. New Arrivals */}
      <ProductShowcase
        title="Nya ankomster - Nytt lager precis in"
        products={newProducts}
        moreLink="/sv/shop?sort=new"
      />

      {/* 10. Fresh Produce Section */}
      <ProductShowcase
        title="Färska produkter - Frukt och grönsaker"
        products={freshProduceProducts}
        moreLink="/sv/product-category/fresh-produce"
      />

      {/* 11. SEO & Brand Content */}
      <SeoContent />

      {/* SEO Structured Data */}
      <SchemaScript
        id="homepage-org-schema"
        schema={idealIndiskaOrganizationSchemaFull()}
      />
    </main>
  );
}
