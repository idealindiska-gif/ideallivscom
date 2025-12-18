import { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/craft";
import { brandProfile } from "@/config/brand-profile";
import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: `Contact Us - ${brandProfile.name} | ${brandProfile.address.city}`,
  description: `Get in touch with ${brandProfile.name}. Visit our store in ${brandProfile.address.area}, call us at ${brandProfile.contact.phone}, or send us a message.We're here to help with all your Indian & Pakistani grocery needs in Stockholm.`,
  keywords: [
    `contact ${brandProfile.name}`,
    "Indian grocery store Stockholm contact",
    "Bandhagen grocery store hours",
    "Pakistani grocery delivery Stockholm",
    ...brandProfile.seo.keywords,
  ].join(", "),
};

export default function ContactPage() {
  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/5 py-16 md:py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6">
              Contact Us & Get in Touch
            </h1>
            <p className="text-xl text-muted-foreground">
              At Ideal Indiska, we are more than just a grocery store; we are a community hub for lovers of authentic Indian and Pakistani food in Stockholm. We love connecting with our customers, whether you visit us in person at our welcoming store in Bandhagen Centrum or have a question about your online order. This is your direct line to us.
            </p>
          </div>
        </Container>
      </section>

      {/* Contact Information Grid */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - Store Info */}
            <div>
              <h2 className="text-3xl font-heading font-bold mb-8">
                Our Home in Stockholm
              </h2>
              <p className="text-muted-foreground mb-8">
                We invite you to step into our store and explore a world of authentic flavours. Our physical location is the heart of our business, where you can browse our curated selection of products, discover new ingredients, and get a real taste of home.
              </p>

              <div className="space-y-6">
                {/* Address */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Store Location</h3>
                    <p className="text-muted-foreground">{brandProfile.name}</p>
                    <p className="text-muted-foreground">{brandProfile.address.street}</p>
                    <p className="text-muted-foreground">
                      {brandProfile.address.postalCode} {brandProfile.address.area}
                    </p>
                    <p className="text-muted-foreground">
                      {brandProfile.address.city}, {brandProfile.address.country}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Phone</h3>
                    <a
                      href={`tel:${brandProfile.contact.phone}`}
                      className="text-primary hover:underline"
                    >
                      {brandProfile.contact.phoneFormatted}
                    </a>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">Email</h3>
                    <a
                      href={`mailto:${brandProfile.contact.email}`}
                      className="text-primary hover:underline"
                    >
                      {brandProfile.contact.email}
                    </a>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">WhatsApp for Quick Questions</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      For the fastest response, especially regarding an order or product availability. It&apos;s the perfect way to get a quick answer.
                    </p>
                    <a
                      href="https://wa.me/46728494801"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-bold"
                    >
                      WhatsApp +46 728 494 801
                    </a>
                  </div>
                </div>

                {/* Opening Hours */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-3">Opening Hours</h3>
                    <div className="space-y-2">
                      {daysOfWeek.map((day) => {
                        const hours = brandProfile.hours[day];
                        return (
                          <div key={day} className="flex justify-between text-sm">
                            <span className="font-medium capitalize">{day}</span>
                            <span className="text-muted-foreground">{hours.display}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Contact Form */}
            <div>
              <div className="bg-muted/30 p-8 rounded-2xl border border-border">
                <h2 className="text-2xl font-heading font-bold mb-6">
                  Send Us a Message
                </h2>
                <p className="text-muted-foreground mb-6">
                  Whether you have a question about a product, need help with your delivery, or just want to share a recipe, we're here for you.
                </p>

                <form className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Product inquiry"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Your message here..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:bg-primary/90 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Map Section (Placeholder) */}
      <section className="py-16 md:py-24 bg-muted/30">
        <Container>
          <div className="aspect-[21/9] rounded-2xl overflow-hidden border border-border bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Map integration placeholder - {brandProfile.address.formatted}
              </p>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
