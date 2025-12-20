import { Metadata } from 'next';
import { brandProfile } from '@/config/brand-profile';
import { Truck, MapPin, Package, Clock, Euro, ShieldCheck, Globe, MessageCircle, Mail, ExternalLink, Info } from 'lucide-react';
import Link from 'next/link';
import { SchemaScript } from '@/lib/schema/schema-script';
import { europeDeliveryServiceSchema } from '@/lib/schema';
import { GoogleMapCompact } from "@/components/shared/google-map";

export const metadata: Metadata = {
    title: 'Europe Delivery | Ideal Indiska LIVS',
    description: 'We deliver authentic Indian & Pakistani groceries across Europe via DHL. No minimum order, no customs hassle within EU.',
    alternates: {
        canonical: '/europe-delivery',
    },
};

export default function EuropeDeliveryPage() {
    return (
        <main className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary/5 via-background to-background border-b">
                <div className="container mx-auto px-4 py-16 md:py-20 text-center md:text-left">
                    <div className="max-w-3xl">
                        <h1 style={{
                            fontSize: '31.25px',
                            fontWeight: 700,
                            lineHeight: 1.47,
                            letterSpacing: '0.02em'
                        }} className="mb-4">
                            Europe Delivery
                        </h1>
                        <p className="text-muted-foreground" style={{
                            fontSize: '16px',
                            fontWeight: 400,
                            lineHeight: 1.52,
                            letterSpacing: '0.03em'
                        }}>
                            Authentic Indian & Pakistani Groceries, Delivered Across Europe. Fast and reliable shipping from Stockholm to your doorstep.
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content & Sidebar */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Main Content Area (2/3) */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Introduction */}
                            <section className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground" style={{
                                fontSize: '16px',
                                fontWeight: 400,
                                lineHeight: 1.52,
                                letterSpacing: '0.03em'
                            }}>
                                <p className="text-foreground font-medium" style={{ fontSize: '18px' }}>
                                    Bringing the tastes of India and Pakistan to your doorstep, anywhere in Europe.
                                </p>
                                <p>
                                    At Ideal Indiska Livs, we are proud to expand our reach beyond Sweden to serve our customers across the entire European continent. Whether you are in Germany, France, the Netherlands, or any other EU country, you can now enjoy our extensive selection of authentic South Asian groceries delivered directly to your home via DHL.
                                </p>
                            </section>

                            {/* European Shipping Overview */}
                            <section className="space-y-6">
                                <h2 style={{ fontSize: '25px', fontWeight: 600 }} className="flex items-center gap-3">
                                    <Globe className="h-6 w-6 text-primary" />
                                    European Shipping Overview
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="p-6 rounded-xl border bg-card/50">
                                        <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-2">No Minimum Order</h3>
                                        <p style={{ fontSize: '15.13px' }} className="text-muted-foreground">Order exactly what you need. There is no minimum purchase requirement for European shipping.</p>
                                    </div>
                                    <div className="p-6 rounded-xl border bg-card/50">
                                        <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-2">Calculated Rates</h3>
                                        <p style={{ fontSize: '15.13px' }} className="text-muted-foreground">Shipping fees are calculated automatically at checkout based on your location and the weight of your order.</p>
                                    </div>
                                </div>
                            </section>

                            {/* Countries We Serve */}
                            <section className="space-y-6">
                                <h2 style={{ fontSize: '25px', fontWeight: 600 }} className="flex items-center gap-3">
                                    <MapPin className="h-6 w-6 text-primary" />
                                    Countries We Serve
                                </h2>
                                <div className="p-6 rounded-xl border bg-card/50 text-muted-foreground">
                                    <p className="mb-4" style={{ fontSize: '15.13px' }}>We ship to all EU member states and several other European countries, including:</p>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-4 text-sm">
                                        {[
                                            "Germany", "France", "Netherlands", "Belgium", "Denmark",
                                            "Finland", "Norway", "Austria", "Italy", "Spain",
                                            "Portugal", "Poland", "Ireland", "Luxembourg"
                                        ].map((country, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                {country}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="mt-4 text-xs italic">Don&apos;t see your country? Contact us via WhatsApp to check availability.</p>
                                </div>
                            </section>

                            {/* DHL Service Options */}
                            <section className="space-y-6">
                                <h2 style={{ fontSize: '25px', fontWeight: 600 }} className="flex items-center gap-3">
                                    <Truck className="h-6 w-6 text-primary" />
                                    Shipping Methods
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex gap-4 p-6 rounded-xl border bg-muted/5 items-start">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Package className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-1">DHL Parcel Connect</h3>
                                            <p style={{ fontSize: '15.13px' }} className="text-muted-foreground">The most common and cost-effective option for residential deliveries across Europe.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-6 rounded-xl border bg-muted/5 items-start">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <ShieldCheck className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-1">Insured & Tracked</h3>
                                            <p style={{ fontSize: '15.13px' }} className="text-muted-foreground">All international shipments are fully insured and include a tracking number for your peace of mind.</p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Sidebar (1/3) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                {/* Shipping Estimator Info */}
                                <div className="border rounded-lg p-6 bg-card">
                                    <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-4">Shipping Info</h3>
                                    <ul className="space-y-4">
                                        <li className="flex gap-3">
                                            <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                                            <div>
                                                <p style={{ fontSize: '13.53px', fontWeight: 500 }}>Estimated Time</p>
                                                <p style={{ fontSize: '12.8px' }} className="text-muted-foreground">2-4 days (Scandinavia)<br />4-7 days (Rest of Europe)</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <Info className="w-5 h-5 text-primary flex-shrink-0" />
                                            <div>
                                                <p style={{ fontSize: '13.53px', fontWeight: 500 }}>Perishables</p>
                                                <p style={{ fontSize: '12.8px' }} className="text-muted-foreground">Note: Fresh & frozen items are for Stockholm local delivery only.</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                {/* Store Location Map */}
                                <div className="bg-card">
                                    <GoogleMapCompact />
                                    <div className="p-4 border border-t-0 rounded-b-lg bg-muted/10">
                                        <p className="text-xs text-center text-muted-foreground">
                                            Shipping from: {brandProfile.address.street}, {brandProfile.address.postalCode} {brandProfile.address.area}
                                        </p>
                                    </div>
                                </div>

                                {/* WhatsApp Help */}
                                <div className="border rounded-lg p-6 bg-muted/30 text-center">
                                    <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-2">European Support</h3>
                                    <p style={{ fontSize: '13.53px' }} className="text-muted-foreground mb-4">Have questions about shipping to your specific country?</p>
                                    <a href="https://wa.me/46728494801" className="inline-block w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm">
                                        WhatsApp Inquiries
                                    </a>
                                </div>

                                {/* Shop CTA */}
                                <div className="border rounded-lg p-6 bg-card">
                                    <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-2">Ready to order?</h3>
                                    <Link href="/shop" className="text-primary hover:underline text-sm flex items-center justify-between">
                                        Start Shopping <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEO Structured Data */}
            <SchemaScript
                id="europe-delivery-schema"
                schema={europeDeliveryServiceSchema()}
            />
        </main>
    );
}
