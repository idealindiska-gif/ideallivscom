import { Metadata } from 'next';
import { brandProfile } from '@/config/brand-profile';
import { Truck, Package, Clock, ShieldCheck, MapPin, ExternalLink, Globe, Info, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { SchemaScript } from "@/lib/schema/schema-script";
import { stockholmDeliveryServiceSchema, deliveryFAQSchema } from "@/lib/schema";
import { GoogleMapCompact } from "@/components/shared/google-map";

export const metadata: Metadata = {
    title: "Grocery Delivery Stockholm & Sweden | Ideal Indiska Livs",
    description: "Get authentic Indian and Pakistani groceries delivered in Stockholm & all over Sweden. Free delivery in Stockholm over 500 SEK. Fast shipping via DHL.",
    alternates: {
        canonical: '/delivery-information',
    },
};

export default function DeliveryInformationPage() {
    return (
        <main className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-muted/30 via-background to-background border-b">
                <div className="container mx-auto px-4 py-16 md:py-20">
                    <div className="max-w-3xl">
                        <h1 style={{
                            fontSize: '31.25px',
                            fontWeight: 700,
                            lineHeight: 1.47,
                            letterSpacing: '0.02em'
                        }} className="mb-4">
                            Grocery Delivery Information
                        </h1>
                        <p className="text-muted-foreground" style={{
                            fontSize: '16px',
                            fontWeight: 400,
                            lineHeight: 1.52,
                            letterSpacing: '0.03em'
                        }}>
                            From our store in Bandhagen to your door. We offer free delivery across all of Stockholm and fast shipping throughout Sweden and Europe.
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
                                    Welcome to Ideal Indiska Livs! We make it easier than ever to get your favourite authentic Indian and Pakistani groceries.
                                </p>
                                <p>
                                    We are proud to offer FREE delivery across all of Stockholm on qualifying orders, as well as fast and flexible shipping options to every corner of Sweden through our trusted partner, DHL. Whether you are in Bandhagen, Södermalm, Kungsholmen, Norrmalm, Vasastan, Östermalm, Gamla Stan, or the surrounding suburbs, getting the taste of home is just a few clicks away.
                                </p>
                            </section>

                            {/* Stockholm Delivery Options */}
                            <section className="space-y-6">
                                <h2 style={{ fontSize: '25px', fontWeight: 600 }} className="flex items-center gap-3">
                                    <MapPin className="h-6 w-6 text-primary" />
                                    Delivery Options for Stockholm
                                </h2>
                                <p className="text-muted-foreground" style={{ fontSize: '16px' }}>
                                    We offer two convenient delivery methods for all our customers within the Stockholm area.
                                </p>

                                <div className="space-y-6">
                                    <div className="p-6 rounded-xl border bg-card/50">
                                        <h3 style={{ fontSize: '20px', fontWeight: 600 }} className="mb-3">1. Ideal Indiska Local Delivery (Our Own Service)</h3>
                                        <div className="space-y-4 text-muted-foreground" style={{ fontSize: '15.13px' }}>
                                            <p>Enjoy our personalized local delivery service with great flexibility and value.</p>
                                            <ul className="list-disc pl-5 space-y-2">
                                                <li><strong>FREE Delivery:</strong> On all orders of 500 kr or more across all of Stockholm.</li>
                                                <li><strong>Standard Delivery:</strong> For orders between 300 kr and 499 kr, a flat delivery fee of just 30 kr applies.</li>
                                                <li><strong>Minimum Order:</strong> The minimum order for our local delivery service is 300 kr.</li>
                                            </ul>

                                            <div className="mt-4 pt-4 border-t">
                                                <h4 className="font-semibold text-foreground mb-2">Coverage Areas:</h4>
                                                <p>Our local delivery covers the entire Stockholm region, including central areas like Södermalm, Kungsholmen, Norrmalm, Vasastan, and Östermalm, as well as surrounding communities including Solna, Sundbyberg, Kista, Nacka, Huddinge, and Järfälla.</p>
                                            </div>

                                            <div className="mt-4 pt-4 border-t">
                                                <h4 className="font-semibold text-foreground mb-2">Special Same-Day Evening Delivery for Our Neighbours:</h4>
                                                <p>For our local community in and around Bandhagen, we offer a special Same-day evening delivery service.</p>
                                                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                                                    <li><strong>Areas:</strong> Bandhagen, Högdalen, Hagsätra, Rågsved, Stureby, Farsta, Älvsjö.</li>
                                                    <li><strong>Schedule:</strong> Place your order before 4 PM (16:00) to receive your delivery the Same day evening between 7 PM - 10 PM.</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 rounded-xl border bg-card/50">
                                        <h3 style={{ fontSize: '20px', fontWeight: 600 }} className="mb-3">2. DHL Shipping within Stockholm</h3>
                                        <p className="text-muted-foreground" style={{ fontSize: '15.13px' }}>
                                            If you prefer the flexibility of DHL or have a larger/heavier order, you can also choose DHL for delivery within Stockholm. Shipping costs are calculated dynamically based on weight and size.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Rest of Sweden */}
                            <section className="space-y-6">
                                <h2 style={{ fontSize: '25px', fontWeight: 600 }} className="flex items-center gap-3">
                                    <Truck className="h-6 w-6 text-primary" />
                                    Shipping to the Rest of Sweden via DHL
                                </h2>
                                <p className="text-muted-foreground" style={{ fontSize: '16px' }}>
                                    We are thrilled to serve customers across all of Sweden with no minimum order requirements.
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-muted/20 border">
                                        <p className="font-semibold" style={{ fontSize: '15.13px' }}>Reliable Partner</p>
                                        <p className="text-sm text-muted-foreground">We use DHL to ensure your groceries arrive safely and promptly anywhere in Sweden.</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-muted/20 border">
                                        <p className="font-semibold" style={{ fontSize: '15.13px' }}>Calculated Rates</p>
                                        <p className="text-sm text-muted-foreground">Fees are based on weight and location, calculated automatically at checkout.</p>
                                    </div>
                                </div>
                            </section>

                            {/* Local Pickup */}
                            <section className="space-y-6">
                                <h2 style={{ fontSize: '25px', fontWeight: 600 }} className="flex items-center gap-3">
                                    <ShoppingBag className="h-6 w-6 text-primary" />
                                    Local Pickup - Always Free!
                                </h2>
                                <div className="p-6 rounded-xl border bg-card/50">
                                    <div className="space-y-4 text-muted-foreground" style={{ fontSize: '15.13px' }}>
                                        <p>You are always welcome to place your order online and collect it from our store in Bandhagen at no extra cost.</p>
                                        <ul className="list-disc pl-5 space-y-2">
                                            <li><strong>Cost:</strong> Free</li>
                                            <li><strong>Location:</strong> Bandhagsplan 4, 12432 Bandhagen Centrum</li>
                                            <li><strong>How it Works:</strong> Select &quot;Local Pickup&quot; at checkout. You will receive an email or SMS notification when your order is ready.</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Our Commitment */}
                            <section className="p-8 rounded-2xl bg-muted/20 border">
                                <h2 style={{ fontSize: '22.36px', fontWeight: 600 }} className="mb-4">Our Delivery Commitment</h2>
                                <p style={{ fontSize: '16px' }} className="text-muted-foreground">
                                    We understand the importance of receiving your groceries in perfect condition. We take great care in packing every order, ensuring that fresh produce, frozen items, and fragile goods are handled appropriately to maintain their quality from our store to your door.
                                </p>
                            </section>
                        </div>

                        {/* Sidebar (1/3) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                {/* Delivery Schedule */}
                                <div className="border rounded-lg p-6 bg-card">
                                    <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-4">Schedule</h3>
                                    <ul className="space-y-4">
                                        <li className="flex gap-3">
                                            <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p style={{ fontSize: '13.53px', fontWeight: 500 }}>Mon - Sun Delivery</p>
                                                <p style={{ fontSize: '12.8px' }} className="text-muted-foreground">7 PM - 10 PM slots</p>
                                            </div>
                                        </li>
                                        <li className="flex gap-3">
                                            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p style={{ fontSize: '13.53px', fontWeight: 500 }}>4 PM Cut-off</p>
                                                <p style={{ fontSize: '12.8px' }} className="text-muted-foreground">For same-day delivery</p>
                                            </div>
                                        </li>
                                    </ul>
                                </div>

                                {/* Quick Links */}
                                <div className="border rounded-lg p-6 bg-card">
                                    <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-4">Regional Details</h3>
                                    <div className="space-y-2">
                                        <Link href="/delivery-goteborg-malmo" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors text-sm">
                                            Göteborg & Malmö <ExternalLink className="w-3 h-3" />
                                        </Link>
                                        <Link href="/europe-delivery" className="flex items-center justify-between p-2 rounded hover:bg-muted transition-colors text-sm">
                                            European Shipping <ExternalLink className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Store Location Map */}
                                <div className="bg-card">
                                    <GoogleMapCompact />
                                    <div className="p-4 border border-t-0 rounded-b-lg bg-muted/10">
                                        <p className="text-xs text-center text-muted-foreground">
                                            Pickup from: {brandProfile.address.street}, {brandProfile.address.postalCode} {brandProfile.address.area}
                                        </p>
                                    </div>
                                </div>

                                {/* Support */}
                                <div className="border rounded-lg p-6 bg-muted/30 text-center">
                                    <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-2">Delivery Help?</h3>
                                    <p style={{ fontSize: '13.53px' }} className="text-muted-foreground mb-4">Contact our delivery team via WhatsApp.</p>
                                    <a href="https://wa.me/46728494801" className="inline-block w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm">
                                        Chat Now
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SEO Structured Data */}
            <SchemaScript
                id="delivery-service-schema"
                schema={stockholmDeliveryServiceSchema()}
            />
            <SchemaScript
                id="delivery-faq-schema"
                schema={deliveryFAQSchema()}
            />
        </main>
    );
}
