import Link from 'next/link';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getOnSaleProducts } from '@/lib/woocommerce/products-direct';
import { translateProducts } from '@/lib/translations';
import { ProductCard } from '@/components/shop/product-card';
import { Loader2, Percent, TrendingDown } from 'lucide-react';
import { brandProfile } from '@/config/brand-profile';
import { SchemaScript } from "@/lib/schema/schema-script";
import { collectionPageSchema } from "@/lib/schema/collection";
import { breadcrumbSchema } from "@/lib/schema/breadcrumb";
import { siteConfig } from '@/site.config';

interface SwedishDealsPageProps {
    params: Promise<{
        locale: string;
    }>;
}

export async function generateMetadata({ params }: SwedishDealsPageProps): Promise<Metadata> {
    const { locale } = await params;

    // Only 'sv' is allowed
    if (locale !== 'sv') {
        notFound();
    }

    const url = `${siteConfig.site_domain}/sv/deals`;
    const urlEn = `${siteConfig.site_domain}/deals`;

    return {
        title: `Erbjudanden på indiska livsmedel Stockholm | ${brandProfile.name}`,
        description: `Stora besparingar på autentiska indiska och pakistanska livsmedel i Stockholm. Färska veckoanbudanden på Basmatiris, kryddor, linser och Halaltkött. Missa inte!`,
        openGraph: {
            title: `Erbjudanden på indiska livsmedel Stockholm | ${brandProfile.name}`,
            description: `Stora besparingar på autentiska indiska och pakistanska livsmedel i Stockholm.`,
            url: url,
            siteName: brandProfile.name,
            type: 'website',
            locale: 'sv_SE',
        },
        alternates: {
            canonical: url,
            languages: {
                'en': urlEn,
                'en-SE': urlEn,
                'sv': url,
                'sv-SE': url,
                'x-default': urlEn,
            },
        },
    };
}

async function SwedishDealsContent() {
    const saleProductsRaw = await getOnSaleProducts(50);
    const saleProducts = translateProducts(saleProductsRaw, 'sv');

    return (
        <div className="min-h-screen w-full bg-background">
            {/* SEO Structured Data */}
            <SchemaScript
                id="deals-breadcrumb"
                schema={breadcrumbSchema([
                    { name: 'Hem', url: `${siteConfig.site_domain}/sv/` },
                    { name: 'Erbjudanden', url: `${siteConfig.site_domain}/sv/deals` },
                ])}
            />
            <SchemaScript
                id="deals-collection"
                schema={collectionPageSchema({
                    name: "Specialerbjudanden på indiska och pakistanska livsmedel",
                    description: "Veckorabatter och kampanjer på autentiska sydasiatiska produkter i Stockholm.",
                    url: `${siteConfig.site_domain}/sv/deals`,
                    items: saleProducts.slice(0, 20).map(p => ({
                        url: `${siteConfig.site_domain}/sv/product/${p.slug}`,
                        name: p.name,
                        image: p.images?.[0]?.src
                    }))
                })}
            />

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/20 dark:via-orange-950/20 dark:to-yellow-950/20">
                <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25" />

                <div className="relative w-full px-5 max-w-[1400px] mx-auto py-16">
                    <div className="flex flex-col items-center text-center space-y-6">
                        {/* Icon */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-400 blur-3xl opacity-30 rounded-full" />
                            <div className="relative p-6 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl shadow-2xl">
                                <Percent className="h-12 w-12 text-white" />
                            </div>
                        </div>

                        {/* Title */}
                        <div className="space-y-3">
                            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
                                Erbjudanden på indiska livsmedel
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto italic font-medium">
                                Stockholms bästa priser på sydasiatiska matvaror.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-8 pt-4">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-border">
                                <TrendingDown className="h-5 w-5 text-red-600" />
                                <span className="text-sm font-semibold text-foreground">
                                    {saleProducts.length} aktiva erbjudanden
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-orange-600 text-white">
                                <Percent className="h-4 w-4" />
                                <span className="text-sm font-bold">
                                    Stockholmsleverans
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* In-depth SEO Description Section */}
            <section className="w-full bg-muted/30 py-12 border-y border-border/50">
                <div className="container mx-auto px-5 max-w-[1400px]">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-heading font-bold text-foreground">
                                Autentiska smaker, <span className="text-primary">oslagbara priser</span>
                            </h2>
                            <p className="text-muted-foreground leading-relaxed">
                                På <strong>Ideal Indiska LIVS</strong> tror vi att autentisk matlagning inte ska kosta skjortan. Våra veckovisa <strong>specialerbjudanden</strong> ger dig de bästa rabatterna på högkvalitativa indiska och pakistanska basvaror här i <strong>Stockholm</strong>.
                            </p>
                            <p className="text-muted-foreground leading-relaxed">
                                Från 5kg påsar med premium <strong>Basmatiris</strong> till viktiga <strong>kryddor och linser</strong>, rabatterar vi regelbundet de varor din familj använder mest. Våra erbjudanden uppdateras varje vecka, så glöm inte att bokmärka denna sida!
                            </p>
                        </div>
                        <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                                <Percent className="w-5 h-5" /> Vad du kan hitta denna vecka:
                            </h3>
                            <ul className="grid grid-cols-2 gap-3 text-sm">
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Ris & mjöl erbjudanden
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Kryddmixrabatter
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Halalkötterbjudanden
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Färska grönsaksrea
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Frysta maträtter
                                </li>
                                <li className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> Veckans varumärke
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <div className="w-full px-5 max-w-[1400px] mx-auto py-12">
                {saleProducts.length > 0 ? (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                Alla erbjudanden ({saleProducts.length})
                            </h2>
                            <p className="text-muted-foreground">
                                Tidsbegränsade erbjudanden - passa på innan de tar slut!
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {saleProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="p-6 bg-muted rounded-full mb-6">
                            <Percent className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-bold text-foreground mb-2">
                            Inga erbjudanden just nu
                        </h2>
                        <p className="text-muted-foreground max-w-md mb-6">
                            Vi har inga specialerbjudanden för tillfället, men kom tillbaka snart för fantastiska deals!
                        </p>
                        <Link
                            href="/sv/shop"
                            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Bläddra bland alla produkter
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default async function SwedishDealsPage({ params }: SwedishDealsPageProps) {
    const { locale } = await params;

    // Only 'sv' is allowed
    if (locale !== 'sv') {
        notFound();
    }

    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Laddar erbjudanden...</p>
                    </div>
                </div>
            }
        >
            <SwedishDealsContent />
        </Suspense>
    );
}
