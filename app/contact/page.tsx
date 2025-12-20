import { Metadata } from "next";
import Link from "next/link";
import { brandProfile } from "@/config/brand-profile";
import { MapPin, Phone, Mail, Clock, MessageSquare, ExternalLink } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { GoogleMapCompact } from "@/components/shared/google-map";

export const metadata: Metadata = {
  title: `Contact Us - ${brandProfile.name} | ${brandProfile.address.city}`,
  description: `Get in touch with ${brandProfile.name}. Visit our store in ${brandProfile.address.area}, call us at ${brandProfile.contact.phone}, or send us a message. We're here to help with all your Indian & Pakistani grocery needs in Stockholm.`,
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactPage() {
  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

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
              Contact Us & Get in Touch
            </h1>
            <p className="text-muted-foreground" style={{
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: 1.52,
              letterSpacing: '0.03em'
            }}>
              We love connecting with our customers! Whether you visit us in person at our store in Bandhagen Centrum or have a question about your online order, we&apos;re here to help.
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
              {/* Direct Lines */}
              <div>
                <h2 style={{
                  fontSize: '25px',
                  fontWeight: 600,
                  lineHeight: 1.47,
                  letterSpacing: '0.02em'
                }} className="mb-8">
                  Get in Touch Directly
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* WhatsApp */}
                  <div className="p-6 rounded-xl border bg-card/50">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-2">WhatsApp</h3>
                    <p style={{ fontSize: '15.13px' }} className="text-muted-foreground mb-4">
                      Fastest response for order status or product availability.
                    </p>
                    <a
                      href="https://wa.me/46728494801"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                      style={{ fontSize: '15.13px' }}
                    >
                      +46 728 494 801 <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* Phone */}
                  <div className="p-6 rounded-xl border bg-card/50">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-2">Call Us</h3>
                    <p style={{ fontSize: '15.13px' }} className="text-muted-foreground mb-4">
                      Give us a call during store hours for immediate help.
                    </p>
                    <a
                      href={`tel:${brandProfile.contact.phone}`}
                      className="text-primary hover:underline font-medium"
                      style={{ fontSize: '15.13px' }}
                    >
                      {brandProfile.contact.phoneFormatted}
                    </a>
                  </div>

                  {/* Email */}
                  <div className="p-6 rounded-xl border bg-card/50">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-2">Email</h3>
                    <p style={{ fontSize: '15.13px' }} className="text-muted-foreground mb-4">
                      For detailed inquiries or feedback, send us an email.
                    </p>
                    <a
                      href={`mailto:${brandProfile.contact.email}`}
                      className="text-primary hover:underline font-medium"
                      style={{ fontSize: '15.13px' }}
                    >
                      {brandProfile.contact.email}
                    </a>
                  </div>

                  {/* Visit */}
                  <div className="p-6 rounded-xl border bg-card/50">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-2">Visit Store</h3>
                    <p style={{ fontSize: '15.13px' }} className="text-muted-foreground mb-4">
                      Bandhagsplan 4, 12432 Stockholm.
                    </p>
                    <a
                      href="https://maps.google.com/?q=Bandhagsplan+4,+12432+Bandhagen"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                      style={{ fontSize: '15.13px' }}
                    >
                      Get Directions <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Message Form */}
              <div className="p-8 rounded-2xl border bg-card">
                <h2 style={{ fontSize: '22.36px', fontWeight: 600 }} className="mb-6">Send us a message</h2>
                <ContactForm />
              </div>
            </div>

            {/* Sidebar (1/3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Opening Hours */}
                <div className="border rounded-lg p-6 bg-card">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3 style={{
                      fontSize: '18.91px',
                      fontWeight: 500,
                      lineHeight: 1.52,
                      letterSpacing: '0.03em'
                    }}>
                      Opening Hours
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {daysOfWeek.map((day) => {
                      const hours = brandProfile.hours[day];
                      return (
                        <div key={day} className="flex justify-between items-center py-1 border-b border-dashed last:border-0">
                          <span style={{ fontSize: '14.31px', fontWeight: 500 }} className="capitalize">{day}</span>
                          <span style={{ fontSize: '13.53px' }} className="text-muted-foreground">{hours.display}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* FAQ Quick Link */}
                <div className="border rounded-lg p-6 bg-muted/30">
                  <h3 style={{
                    fontSize: '18.91px',
                    fontWeight: 500,
                    lineHeight: 1.52,
                    letterSpacing: '0.03em'
                  }} className="mb-2">
                    Finding Answers?
                  </h3>
                  <p className="text-muted-foreground mb-4" style={{ fontSize: '13.53px' }}>
                    Check our FAQ for quick answers about delivery, payments, and products.
                  </p>
                  <Link
                    href="/faq"
                    className="inline-block w-full text-center px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                    style={{ fontSize: '13.53px', fontWeight: 500 }}
                  >
                    View FAQ
                  </Link>
                </div>

                {/* Store Location Map */}
                <div className="bg-card">
                  <GoogleMapCompact />
                  <div className="p-4 border border-t-0 rounded-b-lg bg-muted/10">
                    <p className="text-xs text-muted-foreground mb-2">
                      {brandProfile.address.street}, {brandProfile.address.postalCode} {brandProfile.address.area}
                    </p>
                    <a
                      href="https://maps.google.com/?q=Bandhagsplan+4,+12432+Bandhagen"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-primary hover:underline flex items-center justify-center gap-1"
                    >
                      Open in Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
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
