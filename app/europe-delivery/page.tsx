import Link from 'next/link';
import { Metadata } from 'next';
import {
    StaticPageLayout,
} from '@/components/layout/static-page-layout';
import { brandProfile } from '@/config/brand-profile';
import { Truck, MapPin, Package, Clock, Euro, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Europe Delivery | Ideal Indiska LIVS',
    description: 'We deliver authentic Indian & Pakistani groceries across Europe via DHL. No minimum order, no customs hassle within EU.',
};

export default function EuropeDeliveryPage() {
    return (
        <StaticPageLayout
            title="Europe Delivery"
            description="Authentic Indian & Pakistani Groceries, Delivered Across Europe"
            breadcrumbs={[{ label: 'Europe Delivery', href: '/europe-delivery' }]}
        >
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">

                {/* Hero Section */}
                <section className="space-y-6">
                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-4 text-muted-foreground">
                        <p className="text-lg text-foreground">
                            We are delivering in Sweden and Europe only.
                        </p>
                        <p>
                            Living in Europe but missing the authentic taste of home? Craving the specific spices for your mother's biryani recipe, the right atta for soft rotis, or your favourite childhood snacks? Your search is over. Ideal Indiska Livs, based in Stockholm, Sweden, is now thrilled to offer fast and reliable delivery of traditional Indian and Pakistani groceries to your doorstep, anywhere in Europe.
                        </p>
                        <p>
                            We understand the challenge of finding high-quality, authentic South Asian ingredients. Our mission is to bridge that gap, bringing a curated selection of trusted brands and essential pantry staples directly to your kitchen, whether you're in Denmark, Germany, Finland, France, the Netherlands, Norway, or any other European country.
                        </p>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="space-y-6 scroll-mt-32">
                    <div className="border-b pb-4">
                        <h2 className="text-3xl font-bold tracking-tight">Why Choose Ideal Indiska for Your European Grocery Needs?</h2>
                    </div>

                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-4 text-muted-foreground">
                        <p>We are more than just an online store; we are your dedicated partner in recreating the authentic flavors you love.</p>

                        <div className="grid gap-6 md:grid-cols-2 mt-8 not-prose">
                            <div className="flex gap-4 p-6 rounded-lg border bg-card">
                                <div className="flex-shrink-0">
                                    <Package className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Extensive Range of Authentic Products</h3>
                                    <p className="text-sm text-muted-foreground">From essential spices and masalas from Shan, MDH, and TRS to premium Basmati rice from India Gate and Guard, and beloved snacks from Haldiram's, we stock the brands you know and trust.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-6 rounded-lg border bg-card">
                                <div className="flex-shrink-0">
                                    <Truck className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Reliable Shipping with DHL</h3>
                                    <p className="text-sm text-muted-foreground">We have partnered with DHL, a global leader in logistics, to ensure your order is handled professionally and delivered to you safely and promptly.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-6 rounded-lg border bg-card">
                                <div className="flex-shrink-0">
                                    <ShieldCheck className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">No Customs Hassle (within the EU)</h3>
                                    <p className="text-sm text-muted-foreground">As we ship from Sweden (an EU member state), customers in all other EU countries will not face any additional customs fees or import duties. The price you pay at checkout is the final price.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-6 rounded-lg border bg-card">
                                <div className="flex-shrink-0">
                                    <Euro className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Transparent & Fair Shipping Costs</h3>
                                    <p className="text-sm text-muted-foreground">Our shipping rates are calculated automatically at checkout based on the weight of your order and your destination. There are no hidden fees. We use Stripe, a world-class secure payment gateway.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How It Works */}
                <section className="space-y-6 scroll-mt-32">
                    <div className="border-b pb-4">
                        <h2 className="text-3xl font-bold tracking-tight">How Our European Delivery Works</h2>
                        <p className="text-muted-foreground mt-2">A Simple 3-Step Process</p>
                    </div>

                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-4 text-muted-foreground">
                        <p>Ordering your favourite groceries from another country has never been easier.</p>

                        <div className="space-y-6 mt-8 not-prose">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Shop Your Favourites</h3>
                                    <p className="text-muted-foreground">Browse our full range of products at ideallivs.com. Add everything you need to your cart, from a 10kg bag of atta to a small packet of hing. There is no minimum order amount for European deliveries.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Enter Your European Address</h3>
                                    <p className="text-muted-foreground">At checkout, simply enter your full delivery address in your country (e.g., Germany, France, etc.). Our system will instantly recognize your location and display the available DHL shipping options and their costs.</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Track Your Parcel</h3>
                                    <p className="text-muted-foreground">After you complete your secure payment, we will carefully pack your order and dispatch it. You will receive a DHL tracking number via email, allowing you to follow your parcel's journey right to your door.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section className="space-y-6 scroll-mt-32">
                    <div className="border-b pb-4">
                        <h2 className="text-3xl font-bold tracking-tight">Frequently Asked Questions</h2>
                        <p className="text-muted-foreground mt-2">For Our European Customers</p>
                    </div>

                    <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-muted-foreground">
                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-foreground">Q: Which countries in Europe do you deliver to?</h3>
                            <p>A: We deliver to all countries within the European Union and the wider European region, including but not limited to: Germany, France, Denmark, Finland, Netherlands, Belgium, Austria, Spain, Portugal, Italy, Poland, Norway, Switzerland, and the UK. If you don't see a shipping option for your country, please contact us on WhatsApp.</p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-foreground">Q: How long does delivery to Europe take?</h3>
                            <p>A: Delivery times vary by destination. Typically, shipping to nearby countries like Denmark and Germany takes 2-4 business days, while countries further away may take 4-7 business days. You will get a more precise estimate from DHL with your tracking information.</p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-foreground">Q: Can I order heavy items like a 10kg bag of rice or atta?</h3>
                            <p>A: Yes, absolutely! Our system is set up to handle heavy parcels. The shipping cost will be calculated based on the total weight, making it a convenient way to stock up on bulk items you can't find locally.</p>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-xl font-semibold text-foreground">Q: What about perishable items like fresh produce or frozen goods?</h3>
                            <p>A: To guarantee freshness and quality, our delivery of fresh vegetables (like okra, mangoes) and all frozen items is currently limited to our local Stockholm delivery area. Our European shipments consist of all non-perishable items like spices, rice, dals, flours, snacks, sweets, oils, and more.</p>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="space-y-6">
                    <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 text-center">
                        <h2 className="text-2xl font-bold mb-4">Ready to Bring the Taste of Home to Your European Kitchen?</h2>
                        <p className="text-muted-foreground mb-6">
                            Don't let distance stop you from enjoying the authentic flavors you love. Explore our online store, fill your cart with your favourite brands, and let us bring a piece of India and Pakistan to you.
                        </p>
                        <Link href="/shop" className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                            Start Shopping
                        </Link>
                    </div>
                </section>

            </div>
        </StaticPageLayout>
    );
}
