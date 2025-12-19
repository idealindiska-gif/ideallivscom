import { Metadata } from 'next';
import { brandProfile } from '@/config/brand-profile';
import { FileText, ShoppingCart, CreditCard, Truck, Scale, Shield, Mail, MessageCircle, MapPin } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Ideal Indiska LIVS',
  description: 'Terms and conditions for using ideallivs.com. Learn about our policies on orders, payments, delivery, and more.',
  alternates: {
    canonical: '/terms-conditions',
  },
};

export default function TermsConditionsPage() {
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
              Terms & Conditions
            </h1>
            <p className="text-muted-foreground" style={{
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: 1.52,
              letterSpacing: '0.03em'
            }}>
              Please read these terms carefully before using our services. Your use of our website constitutes agreement to these terms.
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
              <div>
                <p className="text-muted-foreground mb-4" style={{ fontSize: '14.31px' }}>Last Updated: May 29, 2025</p>
                <div className="space-y-6 text-muted-foreground" style={{
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: 1.52,
                  letterSpacing: '0.03em'
                }}>
                  <p>
                    Welcome to {brandProfile.name}. By accessing or using our website <a href={brandProfile.website.url} className="text-primary hover:underline">{brandProfile.website.url}</a>, you agree to be bound by the following terms and conditions. These terms govern your interaction with our online store and physical location.
                  </p>
                </div>
              </div>

              {/* General Use & Orders */}
              <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-4">
                  <h2 style={{ fontSize: '20px', fontWeight: 600 }} className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    1. General Use
                  </h2>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground" style={{ fontSize: '15.13px' }}>
                    <li>All content is for informational purposes.</li>
                    <li>Availability is subject to stock levels.</li>
                    <li>Pricing may change without notice.</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 style={{ fontSize: '20px', fontWeight: 600 }} className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    2. Orders
                  </h2>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground" style={{ fontSize: '15.13px' }}>
                    <li>Confirmed only upon receipt of payment.</li>
                    <li>We reserve the right to cancel orders.</li>
                    <li>Confirmation email is sent after processing.</li>
                  </ul>
                </section>
              </div>

              {/* Pricing & Delivery */}
              <div className="grid sm:grid-cols-2 gap-8">
                <section className="space-y-4">
                  <h2 style={{ fontSize: '20px', fontWeight: 600 }} className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    3. Pricing & Payment
                  </h2>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground" style={{ fontSize: '15.13px' }}>
                    <li>Prices in SEK, including VAT.</li>
                    <li>Secure processing via Stripe.</li>
                    <li>Swish payments require WhatsApp verification.</li>
                  </ul>
                </section>

                <section className="space-y-4">
                  <h2 style={{ fontSize: '20px', fontWeight: 600 }} className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    4. Delivery
                  </h2>
                  <ul className="list-disc pl-5 space-y-2 text-muted-foreground" style={{ fontSize: '15.13px' }}>
                    <li>Free Stockholm delivery over 500 SEK.</li>
                    <li>EU shipping calculated by weight.</li>
                    <li>No fresh/frozen items for EU shipping.</li>
                  </ul>
                </section>
              </div>

              {/* Intellectual Property */}
              <section className="space-y-6">
                <h2 style={{ fontSize: '25px', fontWeight: 600 }} className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-primary" />
                  5. Intellectual Property
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground" style={{ fontSize: '15.13px' }}>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>All content on the site, including text, graphics, logos, and images, is the property of {brandProfile.name} or its content suppliers.</li>
                    <li>Content may not be copied, reproduced, or distributed without our prior written permission.</li>
                  </ul>
                </div>
              </section>

              {/* Legal & Liability */}
              <section className="space-y-6">
                <h2 style={{ fontSize: '25px', fontWeight: 600 }} className="flex items-center gap-3">
                  <Scale className="h-6 w-6 text-primary" />
                  6. Limitation of Liability
                </h2>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground" style={{ fontSize: '15.13px' }}>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>We are not liable for any indirect, incidental, or consequential damages arising from the use of our website or products.</li>
                    <li>We do not warrant that the website will be uninterrupted, timely, secure, or error-free.</li>
                    <li>Our total liability is limited to the amount you paid for the product(s) in question.</li>
                  </ul>
                </div>
              </section>

              {/* Governing Law */}
              <section className="space-y-6">
                <h2 style={{ fontSize: '20px', fontWeight: 600 }}>7. Governing Law</h2>
                <div className="p-6 rounded-xl border bg-muted/5 text-muted-foreground" style={{ fontSize: '15.13px' }}>
                  <p>These terms are governed by and construed in accordance with the laws of Sweden. Any disputes arising from these terms will be resolved in Swedish courts.</p>
                </div>
              </section>
            </div>

            {/* Sidebar (1/3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Legal Entities */}
                <div className="border rounded-lg p-6 bg-card">
                  <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-4">Legal Entity</h3>
                  <div className="space-y-2 text-muted-foreground" style={{ fontSize: '13.53px' }}>
                    <p className="font-bold text-foreground">Sheikh Global Trading</p>
                    <p>{brandProfile.address.street}</p>
                    <p>{brandProfile.address.postalCode} {brandProfile.address.area}</p>
                    <p>{brandProfile.address.city}, {brandProfile.address.country}</p>
                  </div>
                </div>

                {/* Questions */}
                <div className="border rounded-lg p-6 bg-card">
                  <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-4">Have Questions?</h3>
                  <div className="space-y-3">
                    <a href={`mailto:${brandProfile.contact.email}`} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors">
                      <Mail className="h-4 w-4 text-primary" />
                      <span style={{ fontSize: '13.53px' }}>{brandProfile.contact.email}</span>
                    </a>
                    <a href="https://wa.me/46728494801" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <span style={{ fontSize: '13.53px' }}>WhatsApp Support</span>
                    </a>
                  </div>
                </div>

                {/* Related Links */}
                <div className="border rounded-lg p-6 bg-muted/30">
                  <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-4">Related Policies</h3>
                  <div className="space-y-2">
                    <Link href="/privacy-policy" className="block text-primary hover:underline" style={{ fontSize: '14.31px' }}>Privacy Policy</Link>
                    <Link href="/refund-return" className="block text-primary hover:underline" style={{ fontSize: '14.31px' }}>Refund & Return Policy</Link>
                    <Link href="/delivery-information" className="block text-primary hover:underline" style={{ fontSize: '14.31px' }}>Delivery Information</Link>
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
