import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/craft";
import { brandProfile } from "@/config/brand-profile";
import { ShoppingBag, Heart, Users, Award } from "lucide-react";

export const metadata: Metadata = {
  title: `About ${brandProfile.name} - ${brandProfile.tagline}`,
  description: `Learn about ${brandProfile.name}, your trusted source for authentic Indian and Pakistani groceries in Stockholm. Discover our story, commitment to quality, and dedication to serving the South Asian community in Sweden.`,
  keywords: [
    `about ${brandProfile.name}`,
    "Indian grocery store Stockholm",
    "Pakistani grocery Bandhagen",
    "authentic South Asian groceries",
    ...brandProfile.seo.keywords,
  ].join(", "),
  openGraph: {
    title: `About Us - ${brandProfile.name}`,
    description: `Discover ${brandProfile.name}'s story and commitment to bringing authentic Indian & Pakistani groceries to Stockholm.`,
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
              About {brandProfile.name}
            </h1>
            <p className="text-xl text-muted-foreground">
              {brandProfile.tagline}
            </p>
          </div>
        </Container>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                From a Passion for Flavour to Your Local Grocery Store
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Ideal Indiska was born from a deep-rooted love for the authentic flavours of our homeland and a desire to share them with the vibrant community in Stockholm. We noticed a need for a dedicated space where people could find high-quality, genuine Indian and Pakistani groceries without compromise.
                </p>
                <p>
                  What started as a small idea has grown into a cherished local store in Bandhagen, driven by our commitment to bringing you the best ingredients for your traditional recipes and culinary explorations.
                </p>
                <p>
                  We carefully select our products to ensure you find everything you need to create authentic Indian and Pakistani meals, from everyday staples to special occasion delicacies.
                </p>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="https://crm.ideallivs.com/wp-content/uploads/2025/05/whatsapp-image-2025-05-06-at-23.02.51-90cce80c.jpeg"
                alt="Ideal Indiska Store"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
        </Container>
      </section>

      {/* What We Offer */}
      <section className="py-16 md:py-24 bg-muted/30">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              A World of Authentic Ingredients
            </h2>
            <p className="text-muted-foreground">
              At Ideal Indiska, you'll discover an extensive selection of:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <h3 className="font-heading font-bold text-lg mb-2">Aromatic Spices & Masalas</h3>
              <p className="text-sm text-muted-foreground">Whole and ground, sourced for freshness and potency from brands like Shan, MDH, and TRS.</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <h3 className="font-heading font-bold text-lg mb-2">Premium Grains & Dals</h3>
              <p className="text-sm text-muted-foreground">The finest Basmati rice (India Gate, Guard), Atta, various flours, and diverse lentils.</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <h3 className="font-heading font-bold text-lg mb-2">Fresh Produce</h3>
              <p className="text-sm text-muted-foreground">Seasonal vegetables and herbs (karela, bhindi, tinda) essential for South Asian cooking.</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <h3 className="font-heading font-bold text-lg mb-2">Delicious Snacks & Sweets</h3>
              <p className="text-sm text-muted-foreground">Your favourite brands like Haldiram&apos;s and traditional South Asian treats.</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <h3 className="font-heading font-bold text-lg mb-2">Halal Meat & Chicken</h3>
              <p className="text-sm text-muted-foreground">Fresh and quality halal meat products for your everyday needs.</p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <h3 className="font-heading font-bold text-lg mb-2">Frozen Foods & Essentials</h3>
              <p className="text-sm text-muted-foreground">From parathas to paneer and convenient ready-to-cook items.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Our Values */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Our Commitment to You & the Stockholm Community
            </h2>
            <p className="text-muted-foreground">
              Our customers are at the heart of everything we do
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">
                Quality & Authenticity
              </h3>
              <p className="text-sm text-muted-foreground">
                Sourcing genuine products you can trust
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">
                Freshness
              </h3>
              <p className="text-sm text-muted-foreground">
                High standards for all produce and perishables
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">
                Friendly Service
              </h3>
              <p className="text-sm text-muted-foreground">
                Welcoming atmosphere and helpful assistance
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">
                Community Connection
              </h3>
              <p className="text-sm text-muted-foreground">
                Active part of Stockholm's South Asian community
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-muted/30">
        <Container>
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              What Customers Say
            </h2>
            <p className="text-muted-foreground">
              Hear from our valued customers in Stockholm
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <p className="text-muted-foreground mb-4">
                "Glad att jag hittade denna butik! Bra sortiment, hittade allt jag behövde och mer. Vänlig och hjälpsam personal."
              </p>
              <div>
                <p className="font-bold">Linda</p>
                <p className="text-sm text-muted-foreground">Google Reviews</p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <p className="text-muted-foreground mb-4">
                "Trevlig personal och jag är helnöjd med de produkter jag hittills köpt. Kul med ett annat sortiment än det som finns på vanliga matbutikskedjorna. Kommer tveklöst återkomma!"
              </p>
              <div>
                <p className="font-bold">Michaela Svanberg</p>
                <p className="text-sm text-muted-foreground">Google Reviews</p>
              </div>
            </div>

            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <p className="text-muted-foreground mb-4">
                "Upptäckte denna pärla av en indisk butik idag, bra urval med allt man behöver. Frågade efter en viss masala-paste och den mycket trevliga mannen i butiken beställde den direkt, toppen bra service."
              </p>
              <div>
                <p className="font-bold">Sos Jytte Kronstrom</p>
                <p className="text-sm text-muted-foreground">Stockholm</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Visit Us CTA */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center bg-primary/5 p-12 rounded-2xl border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Visit Us or Shop Online
            </h2>
            <p className="text-muted-foreground mb-8">
              Experience the {brandProfile.name} difference for yourself. Visit our store at{" "}
              {brandProfile.address.formatted}, or explore our full range and shop conveniently online.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/shop"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                Shop Online
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3 bg-card border-2 border-primary text-primary rounded-lg font-bold hover:bg-primary/5 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
