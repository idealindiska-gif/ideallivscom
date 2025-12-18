import Link from 'next/link';
import { Metadata } from 'next';
import { Suspense } from 'react';
import { getOnSaleProducts } from '@/lib/woocommerce/products-direct';
import { ProductCard } from '@/components/shop/product-card';
import { Loader2, Percent, TrendingDown } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Deals & Offers | Special Promotions',
    description: 'Discover our latest deals and special offers. Save big on your favorite products with exclusive promotions and discounts.',
};

async function DealsContent() {
    const saleProducts = await getOnSaleProducts(50); // Get up to 50 products on sale

    return (
        <div className="min-h-screen w-full bg-background">
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
                                Deals & Offers
                            </h1>
                            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                                Save big on your favorite products with our exclusive deals and special promotions
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-8 pt-4">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-black/20 backdrop-blur-sm border border-border">
                                <TrendingDown className="h-5 w-5 text-red-600" />
                                <span className="text-sm font-semibold text-foreground">
                                    {saleProducts.length} Products on Sale
                                </span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-orange-600 text-white">
                                <Percent className="h-4 w-4" />
                                <span className="text-sm font-bold">
                                    Up to 50% Off
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="w-full px-5 max-w-[1400px] mx-auto py-12">
                {saleProducts.length > 0 ? (
                    <>
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                All Deals ({saleProducts.length})
                            </h2>
                            <p className="text-muted-foreground">
                                Limited time offers - grab them before they're gone!
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
                            No Deals Available Right Now
                        </h2>
                        <p className="text-muted-foreground max-w-md mb-6">
                            We don't have any special offers at the moment, but check back soon for amazing deals!
                        </p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            Browse All Products
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DealsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground">Loading deals...</p>
                    </div>
                </div>
            }
        >
            <DealsContent />
        </Suspense>
    );
}
