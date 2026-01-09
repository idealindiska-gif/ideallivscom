import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/craft";
import { brandProfile } from "@/config/brand-profile";
import { getProductBrands } from "@/lib/woocommerce/brands";
import { Package, ArrowRight } from "lucide-react";

import { SchemaScript } from "@/lib/schema/schema-script";
import { collectionPageSchema } from "@/lib/schema/collection";

export const metadata: Metadata = {
    title: `Indian & Pakistani Grocery Brands Stockholm | ${brandProfile.name}`,
    description: `Shop the widest selection of authentic Indian and Pakistani grocery brands in Stockholm. Trusted by families since 2020. Shan, Ahmed, National, MTR, Haldiram's, and more.`,
    alternates: {
        canonical: "https://www.ideallivs.com/brands",
    },
    keywords: [
        "top indian brands Stockholm",
        "pakistani grocery stores sweden",
        "best basmati rice brands",
        "halal certified meat brands",
        "shan spices stockholm",
        "haldiram sweets sweden",
        "mtr meals online",
        "ahmed foods supplier",
    ].join(", "),
};

// Revalidate every hour
export const revalidate = 3600;

export default async function ShopByBrandPage() {
    const brands = await getProductBrands({ hide_empty: true });

    return (
        <main className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16 md:py-24">
                <Container>
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
                            Shop Your Favorite Indian & Pakistani Grocery Brands
                        </h1>
                        <p className="text-xl text-muted-foreground mb-4">
                            At {brandProfile.name}, we are proud to bring you a curated selection of the most trusted and beloved Indian and Pakistani grocery brands.
                        </p>
                        <p className="text-lg text-muted-foreground">
                            Whether you're looking for the authentic spices of Shan, the delicious snacks from Haldiram's, or quality staples from ITC and KTC, find them all here. Explore our brand directory below and shop with confidence.
                        </p>
                    </div>
                </Container>
            </section>

            {/* Brands Count */}
            <section className="py-8 bg-muted/30 border-y border-border">
                <Container>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Package className="w-5 h-5" />
                        <span className="font-medium">
                            {brands.length} Premium Brands Available
                        </span>
                    </div>
                </Container>
            </section>

            {/* Brands Grid - Full Width Layout */}
            <section className="py-16 md:py-24">
                <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
                    {brands.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground text-lg">
                                No brands found. Please check back later.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
                            {brands.map((brand) => (
                                <Link
                                    key={brand.id}
                                    href={`/brand/${brand.slug}`}
                                    className="group"
                                >
                                    <article className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col">
                                        {/* Brand Image/Logo */}
                                        <div className="relative aspect-square bg-white flex items-center justify-center p-6 border-b border-border/50">
                                            {brand.image?.src ? (
                                                <Image
                                                    src={brand.image.src}
                                                    alt={brand.image.alt || brand.name}
                                                    fill
                                                    className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                                                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 12vw"
                                                />
                                            ) : (
                                                <div className="text-center w-full">
                                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2 text-primary font-bold text-2xl border-2 border-primary/20">
                                                        {brand.name.charAt(0)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Brand Info */}
                                        <div className="p-4 flex-1 flex flex-col text-center bg-card">
                                            <h3 className="text-sm font-heading font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                                                {brand.name}
                                            </h3>

                                            {brand.count > 0 && (
                                                <p className="text-xs text-muted-foreground mt-auto">
                                                    {brand.count} Products
                                                </p>
                                            )}
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* SEO Content Section */}
            <section className="py-16 md:py-24 bg-muted/30">
                <Container>
                    <div className="max-w-4xl mx-auto prose prose-lg">
                        <h2 className="text-3xl font-heading font-bold mb-6">
                            Why Shop by Brand at {brandProfile.name}?
                        </h2>

                        <div className="space-y-4 text-muted-foreground">
                            <p>
                                <strong>Largest Selection of Indian and Pakistani Brands in Stockholm:</strong>{" "}
                                We understand that when it comes to authentic Indian and Pakistani cooking, the brand matters. That's why we've partnered with the most prestigious and trusted names in South Asian groceries.
                            </p>

                            <p>
                                <strong>Quality You Can Trust:</strong> Every brand we stock has been carefully selected for its commitment to quality, authenticity, and taste. From traditional family favorites to modern innovations, our brands deliver the genuine flavors of India and Pakistan.
                            </p>

                            <p>
                                <strong>Convenient Online Shopping:</strong> Browse by your favorite brand, discover new ones, and order everything you need from the comfort of your home. We offer fast delivery across Stockholm and throughout Sweden.
                            </p>

                            <h3 className="text-2xl font-heading font-bold mt-8 mb-4">
                                Popular Brands at Our Store
                            </h3>

                            <ul className="list-disc pl-6 space-y-2">
                                <li><strong>Shan:</strong> Pakistan's #1 spice brand, perfect for authentic curries and biryanis</li>
                                <li><strong>Ahmed Foods:</strong> Premium quality pickles, spices, and food products</li>
                                <li><strong>MTR:</strong> South Indian specialties and ready-to-eat meals</li>
                                <li><strong>National Foods:</strong> Trusted Pakistani masalas and food products</li>
                                <li><strong>Haldiram's:</strong> India's favorite snacks and sweets</li>
                                <li><strong>KTC:</strong> Quality oils, rice, and cooking essentials</li>
                            </ul>

                            <p className="mt-6">
                                Visit our store in {brandProfile.address.area} or shop online at {brandProfile.website.domain} for the complete range of Indian and Pakistani brands in Stockholm.
                            </p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Structured Data */}
            <SchemaScript
                id="brands-collection-schema"
                schema={collectionPageSchema({
                    name: "Indian & Pakistani Grocery Brands - Ideal Indiska LIVS",
                    description: "Directory of authentic South Asian grocery brands available in Stockholm.",
                    url: "https://www.ideallivs.com/brands",
                    items: brands.map(brand => ({
                        url: `https://www.ideallivs.com/brand/${brand.slug}`,
                        name: brand.name,
                        image: brand.image?.src || undefined
                    }))
                })}
            />
        </main>
    );
}
