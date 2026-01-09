import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, Clock, ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { brandProfile } from '@/config/brand-profile';
import { siteConfig } from '@/site.config';
import { SchemaScript } from '@/lib/schema/schema-script';

export const metadata: Metadata = {
    title: "The Indian Fika: 5 Savory Snacks to Pair with Your Tea | Ideal Indiska",
    description: "Discover how to blend Swedish Fika culture with authentic Indian snacks. From spicy Samosas to crispy Namkeen, here are the best pairings for your afternoon tea.",
    openGraph: {
        title: "The Indian Fika: Authentic Snacks for Your Coffee Break",
        description: "Upgrade your Fika with a spicy twist. Explore the best Indian snacks available in Stockholm.",
        images: [{ url: '/images/blog/indian-fika-hero.png', width: 1200, height: 630, alt: 'Indian Fika Setup' }],
    },
    alternates: {
        canonical: '/blog/the-indian-fika',
    },
};

export default function IndianFikaPage() {
    const publishDate = "January 10, 2026";

    return (
        <article className="min-h-screen bg-background pb-20">
            {/* Article Header */}
            <header className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
                <Image
                    src="/images/blog/indian-fika-hero.png"
                    alt="The Indian Fika Setup"
                    fill
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        <Link
                            href="/blog"
                            className="inline-flex items-center text-primary-200 hover:text-white mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Blog
                        </Link>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6 leading-tight">
                            The Indian Fika: 5 Savory Snacks to Pair with Your Masala Chai
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-primary-100 text-sm md:text-base">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{publishDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>Ideal Indiska Cuisine Team</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>5 min read</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Article Content */}
            <div className="max-w-3xl mx-auto px-6 mt-12">
                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:text-primary prose-p:text-muted-foreground leading-relaxed text-lg">
                    <p className="text-xl text-foreground font-medium mb-8">
                        In Sweden, the concept of <em>Fika</em> is sacred. It’s more than just a coffee break; it’s a moment of pause, community, and indulgence. But what happens when you swap the cinnamon bun for a crispy Samosa, or the black coffee for a steaming cup of spiced Masala Chai?
                    </p>

                    <p>
                        Welcome to the <strong>Indian Fika</strong>. At Ideal Indiska LIVS, we believe that the afternoon "mellanmål" is the perfect opportunity to explore the bold, vibrant flavors of South Asia.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-6 text-primary">1. The Golden Samosa: The King of Tea-Time</h2>
                    <p>
                        If the Kanelbulle is the king of Swedish fika, the Samosa is his Indian counterpart. These triangular pastries, filled with spiced potatoes and peas, offer a satisfying crunch followed by a warm, savory interior.
                    </p>
                    <div className="bg-muted/30 p-6 rounded-2xl border-l-4 border-primary my-8">
                        <strong>Pro Tip:</strong> Reheat them in an air fryer at 180°C for 3 minutes to regain that authentic street-side crispiness.
                    </div>

                    <h2 className="text-2xl font-bold mt-12 mb-6 text-primary">2. Spicy Namkeen: The Ultimate Crunch</h2>
                    <p>
                        Looking for something lighter? <em>Namkeen</em> (Savory snacks) like Aloo Bhujia or Murukku are perfect for mindless munching during a quick office break. They provide a spicy, salty kick that perfectly balances the sweetness of a Swedish latte.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-6 text-primary">3. Masala Chai: The Swedish Oatly's Best Friend</h2>
                    <p>
                        While traditional fika relies on brewed coffee, Masala Chai brings a complex profile of cardamom, cinnamon, and cloves. Interestingly, many our customers in Stockholm love brewing their chai with local Swedish oat milk for a creamier, eco-friendly twist.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-6 text-primary">4. Parle-G: The Nostalgia Biscuit</h2>
                    <p>
                        Every Indian grew up dipping Parle-G biscuits into tea. These simple, malted biscuits are the "Digestive" of South Asia. They are light, slightly sweet, and incredibly affordable—a true staple at any Ideal Indiska shopping trip.
                    </p>

                    <h2 className="text-2xl font-bold mt-12 mb-6 text-primary">5. Gulab Jamun: For the Sweet Tooth</h2>
                    <p>
                        Sometimes, you just need a sugar rush. Gulab Jamun—soft, syrup-soaked dough balls—is the ultimate indulgence. While usually served warm at dinner, a single Gulab Jamun with a cup of strong tea is a daytime luxury everyone in Stockholm should try.
                    </p>

                    <div className="mt-16 p-8 bg-primary/5 rounded-3xl border border-primary/10 text-center">
                        <h3 className="text-2xl font-bold text-primary mb-4">Ready to try your first Indian Fika?</h3>
                        <p className="mb-8">Visit our store in Bandhagen or shop our "Fika Favorites" selection online today!</p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white px-8">
                                <Link href="/shop?category=snacks-sweets">Shop Snacks Online</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="px-8">
                                <Link href="/contact">Visit Our Bandhagen Store</Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Share & Meta */}
                <footer className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground">Share this article:</span>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground italic">
                        Keywords: Indian Snacks Stockholm, Pakistani Namkeen Sweden, Masala Chai Stockholm, Best Samosas near me.
                    </div>
                </footer>
            </div>

            {/* Article Schema */}
            <SchemaScript
                id="fika-article-schema"
                schema={{
                    "@context": "https://schema.org",
                    "@type": "BlogPosting",
                    "headline": "The Indian Fika: 5 Savory Snacks to Pair with Your Tea",
                    "image": `${siteConfig.site_domain}/images/blog/indian-fika-hero.png`,
                    "author": {
                        "@type": "Organization",
                        "name": "Ideal Indiska LIVS"
                    },
                    "publisher": {
                        "@type": "Organization",
                        "name": "Ideal Indiska LIVS",
                        "logo": {
                            "@type": "ImageObject",
                            "url": "https://crm.ideallivs.com/wp-content/uploads/2025/04/final-new-logo-black.png"
                        }
                    },
                    "datePublished": "2026-01-10",
                    "description": "Discover how to blend Swedish Fika culture with authentic Indian snacks. From spicy Samosas to crispy Namkeen."
                }}
            />
        </article>
    );
}
