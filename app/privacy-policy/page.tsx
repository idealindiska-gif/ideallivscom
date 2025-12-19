import { Metadata } from 'next';
import { brandProfile } from '@/config/brand-profile';
import { ShieldCheck, Lock, Eye, FileText, MessageCircle, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Ideal Indiska LIVS',
  description: 'Our commitment to protecting your privacy and handling your personal data with transparency and care, in full GDPR compliance.',
  alternates: {
    canonical: '/privacy-policy',
  },
};

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="text-muted-foreground" style={{
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: 1.52,
              letterSpacing: '0.03em'
            }}>
              Your privacy and data protection are our priority. Learn how we handle your personal data with transparency and care.
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
                <p className="text-muted-foreground mb-4" style={{ fontSize: '14.31px' }}>Last Updated: September 20, 2025</p>
                <div className="space-y-6 text-muted-foreground" style={{
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: 1.52,
                  letterSpacing: '0.03em'
                }}>
                  <p>
                    At {brandProfile.name} (part of Sheikh Global Trading), we are deeply committed to protecting your privacy and handling your personal data with transparency and care. This Privacy Policy explains how we collect, use, store, and safeguard your information when you visit our website, {brandProfile.website.url}, or interact with our services.
                  </p>
                  <p>
                    We operate in full compliance with the General Data Protection Regulation (GDPR) (EU) 2016/679 and applicable Swedish data protection laws. Our goal is to ensure you feel secure and confident when you shop with us, whether you are in Stockholm, Sweden, or anywhere else in Europe.
                  </p>
                </div>
              </div>

              {/* Data Collection */}
              <section className="space-y-6">
                <h2 style={{ fontSize: '25px', fontWeight: 600 }} className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  What Personal Data Do We Collect?
                </h2>
                <div className="space-y-4 text-muted-foreground" style={{ fontSize: '16px' }}>
                  <p>We collect information that is necessary to provide you with our services and to improve your shopping experience:</p>
                  <ul className="list-disc pl-6 space-y-4">
                    <li><strong>Identity & Contact Data:</strong> Your first name, last name, email address, phone number, and delivery address, which you provide when creating an account or placing an order.</li>
                    <li><strong>Transactional Data:</strong> Details about products you have purchased and the payment method used. We do not store your full credit card details (processed securely via Stripe).</li>
                    <li><strong>Technical Data:</strong> IP address, browser type, device information, and general location collected automatically when you browse our site.</li>
                    <li><strong>Communication Data:</strong> Information you provide when contacting us via email, WhatsApp, or our contact form.</li>
                  </ul>
                </div>
              </section>

              {/* Data Usage */}
              <section className="space-y-6">
                <h2 style={{ fontSize: '25px', fontWeight: 600 }} className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-primary" />
                  How We Use Your Personal Data
                </h2>
                <div className="space-y-4 text-muted-foreground" style={{ fontSize: '16px' }}>
                  <ul className="list-disc pl-6 space-y-4">
                    <li><strong>Order Fulfillment:</strong> To process payments, pack orders, and arrange delivery.</li>
                    <li><strong>Customer Service:</strong> To communicate status and respond to inquiries.</li>
                    <li><strong>Improvements:</strong> To analyze how customers use our site and improve the user experience.</li>
                    <li><strong>Marketing:</strong> With your consent, we send info about new products and special offers.</li>
                    <li><strong>Security:</strong> To prevent fraud and maintain the security of our website.</li>
                  </ul>
                </div>
              </section>

              {/* Cookies */}
              <section className="space-y-6">
                <h2 style={{ fontSize: '25px', fontWeight: 600 }}>Our Use of Cookies</h2>
                <div className="p-6 rounded-xl border bg-card/50 text-muted-foreground" style={{ fontSize: '15.13px' }}>
                  <p className="mb-4">We use cookies to enhance your browsing experience:</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Essential Cookies:</strong> Necessary for the website to function correctly (e.g., shopping cart).</li>
                    <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our website.</li>
                    <li><strong>Marketing Cookies:</strong> Used to provide more relevant advertisements if you have consented.</li>
                  </ul>
                </div>
              </section>

              {/* GDPR Rights */}
              <section className="space-y-6">
                <h2 style={{ fontSize: '25px', fontWeight: 600 }} className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  Your GDPR Rights
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Right to Access", "Right to Rectification",
                    "Right to Erasure", "Right to Restrict Processing",
                    "Right to Data Portability", "Right to Object"
                  ].map((right, i) => (
                    <div key={i} className="p-4 rounded-lg border bg-card/50">
                      <p style={{ fontSize: '15.13px', fontWeight: 500 }}>{right}</p>
                    </div>
                  ))}
                </div>
                <p className="text-sm italic text-muted-foreground">To exercise any of these rights, please contact us at {brandProfile.contact.email}.</p>
              </section>
            </div>

            {/* Sidebar (1/3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Data Controller */}
                <div className="border rounded-lg p-6 bg-card">
                  <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-4">Data Controller</h3>
                  <div className="space-y-2 text-muted-foreground" style={{ fontSize: '13.53px' }}>
                    <p className="font-bold text-foreground">Sheikh Global Trading</p>
                    <p>{brandProfile.address.street}</p>
                    <p>{brandProfile.address.postalCode} {brandProfile.address.area}</p>
                    <p>{brandProfile.address.city}, {brandProfile.address.country}</p>
                  </div>
                </div>

                {/* Privacy Contact */}
                <div className="border rounded-lg p-6 bg-card">
                  <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-4">Privacy Inquiries</h3>
                  <div className="space-y-3">
                    <a href={`mailto:${brandProfile.contact.email}`} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors">
                      <Mail className="h-4 w-4 text-primary" />
                      <span style={{ fontSize: '13.53px' }}>{brandProfile.contact.email}</span>
                    </a>
                    <a href="https://wa.me/46728494801" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors">
                      <MessageCircle className="h-4 w-4 text-primary" />
                      <span style={{ fontSize: '13.53px' }}>Privacy via WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* Other Policies */}
                <div className="border rounded-lg p-6 bg-muted/30">
                  <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-4">Other Policies</h3>
                  <div className="space-y-2">
                    <Link href="/terms-conditions" className="block text-primary hover:underline" style={{ fontSize: '14.31px' }}>Terms & Conditions</Link>
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
