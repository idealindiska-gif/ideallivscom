import { Metadata } from 'next';
import { brandProfile } from '@/config/brand-profile';
import { RotateCcw, Package, Clock, CheckCircle2, XCircle, Mail, MessageCircle, MapPin } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Refund & Return Policy | Ideal Indiska LIVS',
    description: '14-day return policy for eligible items. Learn about our return process for customers in Sweden and Europe.',
    alternates: {
        canonical: '/refund-return',
    },
};

export default function RefundReturnPage() {
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
                            Refund & Return Policy
                        </h1>
                        <p className="text-muted-foreground" style={{
                            fontSize: '16px',
                            fontWeight: 400,
                            lineHeight: 1.52,
                            letterSpacing: '0.03em'
                        }}>
                            Your satisfaction is our top priority. We are committed to providing a clear and fair return process for our customers across Sweden and Europe.
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
                            {/* Overview */}
                            <div>
                                <p className="text-muted-foreground mb-4" style={{ fontSize: '14.31px' }}>Last Updated: September 20, 2025</p>
                                <div className="space-y-6 text-muted-foreground" style={{
                                    fontSize: '16px',
                                    fontWeight: 400,
                                    lineHeight: 1.52,
                                    letterSpacing: '0.03em'
                                }}>
                                    <p>
                                        At {brandProfile.name}, your satisfaction is our top priority. We offer a <strong className="text-foreground">14-day return window</strong> for eligible items, provided they meet our eligibility criteria for safety and health standards.
                                    </p>
                                </div>
                            </div>

                            {/* Eligibility Grid */}
                            <div className="grid sm:grid-cols-2 gap-8">
                                <section className="space-y-4">
                                    <h2 style={{ fontSize: '20px', fontWeight: 600 }} className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-primary" />
                                        Eligible Items
                                    </h2>
                                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground" style={{ fontSize: '15.13px' }}>
                                        <li>Non-perishable dry goods.</li>
                                        <li>Unused and unopened items.</li>
                                        <li>Original, sealed packaging.</li>
                                        <li>Proof of purchase provided.</li>
                                    </ul>
                                </section>

                                <section className="space-y-4">
                                    <h2 style={{ fontSize: '20px', fontWeight: 600 }} className="flex items-center gap-2">
                                        <XCircle className="h-5 w-5 text-destructive" />
                                        Non-Returnable
                                    </h2>
                                    <ul className="list-disc pl-5 space-y-2 text-muted-foreground" style={{ fontSize: '15.13px' }}>
                                        <li>Fresh produce and dairy.</li>
                                        <li>Frozen items (paneer, parathas).</li>
                                        <li>Opened or broken seals.</li>
                                        <li>Clearance or final sale items.</li>
                                    </ul>
                                </section>
                            </div>

                            {/* Return Process */}
                            <section className="space-y-6">
                                <h2 style={{ fontSize: '25px', fontWeight: 600 }} className="flex items-center gap-3">
                                    <RotateCcw className="h-6 w-6 text-primary" />
                                    How to Return
                                </h2>
                                <div className="space-y-6">
                                    <div className="p-6 rounded-xl border bg-card/50">
                                        <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-3">In-Store (Stockholm)</h3>
                                        <p style={{ fontSize: '15.13px' }} className="text-muted-foreground">You are welcome to return eligible items directly to our physical store at Bandhagsplan 4. Please bring your proof of purchase (order confirmation or receipt) with you.</p>
                                    </div>
                                    <div className="p-6 rounded-xl border bg-card/50">
                                        <h3 style={{ fontSize: '18px', fontWeight: 600 }} className="mb-3">By Post (Sweden & Europe)</h3>
                                        <div className="space-y-3 text-muted-foreground" style={{ fontSize: '15.13px' }}>
                                            <p>1. Contact us first via WhatsApp or email to notify us of your return request.</p>
                                            <p>2. Once confirmed, pack the items securely and ship them to our Stockholm address.</p>
                                            <p><strong>Note:</strong> Return shipping costs are the responsibility of the customer, unless the return is due to our error (e.g., wrong or defective item sent).</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Damaged & Out of Stock */}
                            <section className="space-y-6">
                                <h2 style={{ fontSize: '25px', fontWeight: 600 }} className="flex items-center gap-3">
                                    <Package className="h-6 w-6 text-primary" />
                                    Special Circumstances
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="p-5 rounded-lg bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30">
                                        <h3 className="font-semibold mb-2" style={{ fontSize: '16px' }}>Damaged Items</h3>
                                        <p style={{ fontSize: '14.31px' }} className="text-muted-foreground">If you receive a damaged or incorrect item, contact us immediately. In such cases, we will cover the return shipping costs.</p>
                                    </div>
                                    <div className="p-5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                                        <h3 className="font-semibold mb-2" style={{ fontSize: '16px' }}>Out of Stock</h3>
                                        <p style={{ fontSize: '14.31px' }} className="text-muted-foreground">If an item sells out before we process your order, we will contact you immediately for a full refund or suitable alternative.</p>
                                    </div>
                                </div>
                            </section>

                            {/* Refund Processing */}
                            <section className="space-y-6">
                                <h2 style={{ fontSize: '25px', fontWeight: 600 }}>Refund Processing</h2>
                                <div className="bg-muted/10 p-6 rounded-xl border">
                                    <p style={{ fontSize: '16px' }} className="text-muted-foreground">
                                        Once we receive and inspect your returned item, your refund will be processed automatically to your original payment method within <strong className="text-foreground">5-10 business days</strong>.
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Sidebar (1/3) */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                {/* Need Immediate Help? */}
                                <div className="border rounded-lg p-6 bg-card">
                                    <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-4">Need Help?</h3>
                                    <div className="space-y-3">
                                        <a href="https://wa.me/46728494801" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors">
                                            <MessageCircle className="h-4 w-4 text-primary" />
                                            <span style={{ fontSize: '13.53px' }}>WhatsApp Support</span>
                                        </a>
                                        <a href={`mailto:${brandProfile.contact.email}`} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors">
                                            <Mail className="h-4 w-4 text-primary" />
                                            <span style={{ fontSize: '13.53px' }}>Email Returns Team</span>
                                        </a>
                                    </div>
                                </div>

                                {/* Store Info */}
                                <div className="border rounded-lg p-6 bg-card">
                                    <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-4">Return Address</h3>
                                    <div className="space-y-2 text-muted-foreground" style={{ fontSize: '13.53px' }}>
                                        <p className="font-bold text-foreground">{brandProfile.name}</p>
                                        <p>{brandProfile.address.street}</p>
                                        <p>{brandProfile.address.postalCode} {brandProfile.address.area}</p>
                                        <p>{brandProfile.address.city}, {brandProfile.address.country}</p>
                                    </div>
                                </div>

                                {/* FAQ Link */}
                                <div className="border rounded-lg p-6 bg-muted/30">
                                    <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-4">Quick Questions</h3>
                                    <div className="space-y-2">
                                        <p style={{ fontSize: '13.53px' }} className="text-muted-foreground mb-4">Common questions about missing items or out-of-stock products are answered in our FAQ.</p>
                                        <Link href="/faq" className="block text-primary hover:underline font-medium" style={{ fontSize: '14.31px' }}>Visit FAQ Page</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
