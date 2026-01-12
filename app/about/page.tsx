import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { brandProfile } from "@/config/brand-profile";
import { ShoppingBag, Heart, Users, Award, MessageCircle, Mail, MapPin } from "lucide-react";
import { GoogleMapCompact } from "@/components/shared/google-map";

// ISR: Revalidate static pages every 24 hours
export const revalidate = 86400;

export const metadata: Metadata = {
  title: `About ${brandProfile.name} - Stockholm's Best Indian & Pakistani Grocery`,
  description: `Discover the story of ${brandProfile.name}. Since 2020, we have been Stockholm's most trusted source for authentic Indian and Pakistani groceries, premium Basmati rice, and Halal meat.`,
  alternates: {
    canonical: '/about',
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-muted/30 via-background to-background border-b">
        <div className="container mx-auto px-4 py-16 md:py-20 text-left">
          <div className="max-w-3xl">
            <h1 style={{
              fontSize: '31.25px',
              fontWeight: 700,
              lineHeight: 1.47,
              letterSpacing: '0.02em'
            }} className="mb-4">
              About {brandProfile.name}
            </h1>
            <p className="text-muted-foreground" style={{
              fontSize: '16px',
              fontWeight: 400,
              lineHeight: 1.52,
              letterSpacing: '0.03em'
            }}>
              {brandProfile.tagline} Discover why we&apos;re Stockholm&apos;s premier destination for authentic South Asian flavours.
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
              {/* Our Story */}
              <div>
                <h2 style={{
                  fontSize: '25px',
                  fontWeight: 600,
                  lineHeight: 1.47,
                  letterSpacing: '0.02em'
                }} className="mb-6">
                  From Passion to Your Local Grocery Store
                </h2>
                <div className="space-y-6 text-muted-foreground" style={{
                  fontSize: '16px',
                  fontWeight: 400,
                  lineHeight: 1.52,
                  letterSpacing: '0.03em'
                }}>
                  <p>
                    Ideal Indiska was born in 2020 from a deep-rooted love for the authentic flavours of our homeland and a desire to share them with the vibrant community in Stockholm. We noticed a need for a dedicated space where people could find high-quality, genuine Indian and Pakistani groceries without compromise.
                  </p>
                  <p>
                    From our humble beginnings at <strong>Bandhagen Centrum</strong>, we have grown into Stockholm's premier destination for South Asian cooking essentials. We take pride in being a bridge to home for thousands of families across Sweden.
                  </p>
                  <div className="relative aspect-video rounded-2xl overflow-hidden shadow-sm border mt-8">
                    <Image
                      src="https://crm.ideallivs.com/wp-content/uploads/2025/05/whatsapp-image-2025-05-06-at-23.02.51-90cce80c.jpeg"
                      alt="Ideal Indiska Store"
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  </div>
                  <p className="mt-8">
                    We carefully select our products to ensure you find everything you need to create authentic Indian and Pakistani meals, from everyday staples to special occasion delicacies.
                  </p>
                </div>
              </div>

              {/* What We Offer */}
              <div>
                <h2 style={{
                  fontSize: '25px',
                  fontWeight: 600,
                  lineHeight: 1.47,
                  letterSpacing: '0.02em'
                }} className="mb-6">
                  A World of Authentic Ingredients
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {[
                    { title: "Aromatic Spices", desc: "Whole and ground, sourced for freshness from brands like Shan, MDH, and TRS.", icon: Award },
                    { title: "Premium Grains", desc: "The finest Basmati rice (India Gate, Guard), Atta, and diverse lentils.", icon: ShoppingBag },
                    { title: "Fresh Produce", desc: "Seasonal vegetables and herbs (karela, bhindi, tinda) essential for cooking.", icon: Heart },
                    { title: "South Asian Treats", desc: "Favourite snacks from brands like Haldiram&apos;s and traditional sweets.", icon: Users },
                  ].map((item, i) => (
                    <div key={i} className="p-6 rounded-xl border bg-card/50">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 style={{ fontSize: '18.91px', fontWeight: 500 }} className="mb-2">{item.title}</h3>
                      <p style={{ fontSize: '15.13px' }} className="text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Testimonials */}
              <section className="space-y-6 pt-12 border-t">
                <h2 style={{ fontSize: '25px', fontWeight: 600 }}>What Our Customers Say</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    {
                      text: "Glad att jag hittade denna butik! Bra sortiment, hittade allt jag behövde och mer. Vänlig och hjälpsam personal.",
                      author: "Linda",
                      source: "Google Reviews"
                    },
                    {
                      text: "Kul med ett annat sortiment än det som finns på vanliga matbutikskedjorna. Kommer tveklöst återkomma!",
                      author: "Michaela Svanberg",
                      source: "Google Reviews"
                    }
                  ].map((t, i) => (
                    <div key={i} className="p-6 rounded-2xl border bg-muted/10 italic">
                      <p className="text-muted-foreground mb-4" style={{ fontSize: '15.13px' }}>&quot;{t.text}&quot;</p>
                      <div className="not-italic">
                        <p className="font-semibold" style={{ fontSize: '14.31px' }}>{t.author}</p>
                        <p className="text-xs text-muted-foreground">{t.source}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar (1/3) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Store Values */}
                <div className="border rounded-lg p-6 bg-card">
                  <h3 style={{
                    fontSize: '18.91px',
                    fontWeight: 500,
                    lineHeight: 1.52,
                    letterSpacing: '0.03em'
                  }} className="mb-4">
                    Our Values
                  </h3>
                  <div className="space-y-6">
                    {[
                      { title: "Authenticity", desc: "Genuine products you can trust.", icon: Award },
                      { title: "Freshness", desc: "High standards for all produce.", icon: Heart },
                      { title: "Friendly Service", desc: "Welcoming and helpful assistance.", icon: Users },
                    ].map((value, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                          <value.icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p style={{ fontSize: '13.53px', fontWeight: 500 }}>{value.title}</p>
                          <p style={{ fontSize: '12.8px' }} className="text-muted-foreground">{value.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Sidebar Card */}
                <div className="border rounded-lg p-6 bg-card">
                  <h3 style={{
                    fontSize: '18.91px',
                    fontWeight: 500,
                    lineHeight: 1.52,
                    letterSpacing: '0.03em'
                  }} className="mb-4">
                    Contact Us
                  </h3>
                  <div className="space-y-4">
                    <a
                      href="https://wa.me/46728494801"
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p style={{ fontSize: '13.53px', fontWeight: 500 }}>WhatsApp</p>
                        <p className="text-muted-foreground" style={{ fontSize: '12.8px' }}>Chat with us</p>
                      </div>
                    </a>
                    <a
                      href="mailto:info@ideallivs.com"
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <Mail className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p style={{ fontSize: '13.53px', fontWeight: 500 }}>Email</p>
                        <p className="text-muted-foreground" style={{ fontSize: '12.8px' }}>info@ideallivs.com</p>
                      </div>
                    </a>
                    <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                      <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <p style={{ fontSize: '13.53px', fontWeight: 500 }}>Visit Store</p>
                        <p className="text-muted-foreground" style={{ fontSize: '12.8px' }}>
                          Bandhagsplan 4, Stockholm
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Store Location Map */}
                <div className="bg-card">
                  <GoogleMapCompact />
                  <div className="p-4 border border-t-0 rounded-b-lg bg-muted/10">
                    <p className="text-xs text-center text-muted-foreground">
                      {brandProfile.address.street}, {brandProfile.address.postalCode} {brandProfile.address.area}
                    </p>
                  </div>
                </div>

                {/* New Customer? CTA */}
                <div className="border rounded-lg p-6 bg-muted/30">
                  <h3 style={{
                    fontSize: '18.91px',
                    fontWeight: 500,
                    lineHeight: 1.52,
                    letterSpacing: '0.03em'
                  }} className="mb-2">
                    Ready to Shop?
                  </h3>
                  <p className="text-muted-foreground mb-4" style={{ fontSize: '13.53px' }}>
                    Explore our full range of 150+ brands online.
                  </p>
                  <Link
                    href="/shop"
                    className="inline-block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    style={{ fontSize: '13.53px', fontWeight: 500 }}
                  >
                    Start Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
