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
import { setRequestLocale } from 'next-intl/server';
import { useTranslations } from 'next-intl';

// ISR: Revalidate every 2 hours
export const revalidate = 7200;

interface PageProps {
    params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale } = await params;

    if (locale === 'sv') {
        return {
            title: "Ideal Indiska LIVS | Indiska & Pakistanska Matvaror Stockholm",
            description: "Stockholms bästa indiska & pakistanska livsmedelsbutik. Handla premium Basmati-ris, aromatiska kryddor, halaltkött och färska produkter. Snabb leverans i Stockholm & Europa.",
            alternates: {
                canonical: "https://www.ideallivs.com/sv",
                languages: {
                    'en': 'https://www.ideallivs.com',
                    'sv': 'https://www.ideallivs.com/sv',
                },
            },
            openGraph: {
                title: "Ideal Indiska LIVS - Indiska & Pakistanska Matvaror i Stockholm",
                description: "Din pålitliga källa för autentiska indiska och pakistanska livsmedel i Stockholm. Färska produkter, aromatiska kryddor, premium Basmati-ris och halaltkött levererat till din dörr.",
                url: "https://www.ideallivs.com/sv",
                siteName: "Ideal Indiska LIVS",
                locale: "sv_SE",
                type: "website",
            },
        };
    }

    // English (default)
    return {
        title: "Ideal Indiska LIVS | Authentic Indian & Pakistani Groceries Stockholm",
        description: "Stockholm's best Indian & Pakistani grocery store. Shop premium Basmati rice, aromatic spices, Halal meat, and fresh produce. Fast delivery in Stockholm & Europe-wide.",
        alternates: {
            canonical: "https://www.ideallivs.com",
            languages: {
                'en': 'https://www.ideallivs.com',
                'sv': 'https://www.ideallivs.com/sv',
            },
        },
    };
}

export default async function LocaleHomePage({ params }: PageProps) {
    const { locale } = await params;

    // Enable static rendering for this locale
    setRequestLocale(locale);

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

    // Swedish translations for headlines
    const titles = locale === 'sv' ? {
        hero: "Autentiska Indiska & Pakistanska Matvaror i Stockholm",
        heroSubtitle: "Från aromatiska kryddor till premium Basmati-ris, halaltkött till färska produkter - allt du behöver för autentisk sydasiatisk matlagning. Levererat till din dörr i Stockholm.",
        heroBadge: "Fri Leverans Över 500 SEK",
        deals: "Specialerbjudanden på Indiska & Pakistanska Matvaror",
        trending: "Kundfavoriter - Mest Populära Produkter",
        haldiram: "Haldiram's - Autentiska Indiska Snacks",
        newArrivals: "Nyheter - Nytt Lager Just In",
        freshProduce: "Färska Produkter - Frukt & Grönsaker",
    } : {
        hero: "Authentic Indian & Pakistani Groceries in Stockholm",
        heroSubtitle: "From aromatic spices to premium Basmati rice, halal meat to fresh produce - everything you need for authentic South Asian cooking. Delivered to your door in Stockholm.",
        heroBadge: "Free Delivery Over 500 SEK",
        deals: "Special Offers on Indian & Pakistani Groceries",
        trending: "Customer Favorites - Most Popular Items",
        haldiram: "Haldiram's - Authentic Indian Snacks",
        newArrivals: "Fresh Arrivals - New Stock Just In",
        freshProduce: "Fresh Produce - Fruits & Vegetables",
    };

    // Locale-aware links
    const linkPrefix = locale === 'sv' ? '/sv' : '';

    return (
        <main className="flex min-h-screen flex-col bg-background pb-20 overflow-x-hidden max-w-full">
            {/* 1. Hero Section */}
            <Hero
                title={titles.hero}
                subtitle={titles.heroSubtitle}
                badge={titles.heroBadge}
            />

            {/* 2. Features/Benefits Section */}
            <Features />

            {/* 3. Top Categories */}
            <CategoryGrid categories={categories} />

            {/* 4. Promotion/Deals Grid */}
            <PromotionGrid />

            {/* 5. Special Offers */}
            <ProductShowcase
                title={titles.deals}
                products={dealProducts}
                moreLink={`${linkPrefix}/deals`}
            />

            {/* 6. Banner Strip */}
            <BannerStrip />

            {/* 7. Trending Products */}
            <ProductShowcase
                title={titles.trending}
                products={trendingProducts}
                moreLink={`${linkPrefix}/shop?sort=bestsellers`}
            />

            {/* 8. Haldiram Section */}
            <ProductShowcase
                title={titles.haldiram}
                products={haldiramProducts}
                moreLink={`${linkPrefix}/brand/haldiram`}
            />

            {/* 9. New Arrivals */}
            <ProductShowcase
                title={titles.newArrivals}
                products={newProducts}
                moreLink={`${linkPrefix}/shop?sort=new`}
            />

            {/* 10. Fresh Produce Section */}
            <ProductShowcase
                title={titles.freshProduce}
                products={freshProduceProducts}
                moreLink={`${linkPrefix}/product-category/fresh-produce`}
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
