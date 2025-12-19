import { Metadata } from 'next';
import Link from 'next/link';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageCircle, Mail, MapPin } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Frequently Asked Questions | Ideal Indiska LIVS',
    description: 'Get answers to common questions about ordering Indian and Pakistani groceries in Stockholm, delivery options across Sweden and Europe, payment methods, and our products.',
    alternates: {
        canonical: '/faq',
    },
};

const faqs = [
    {
        category: "Ordering & Payment",
        questions: [
            {
                q: "How do I place an order?",
                a: "Placing an order is easy! Simply browse our website, add your desired items to the shopping cart, and proceed to checkout. You'll enter your delivery address, choose from Store delivery, pickup, or DHL options, and complete payment securely."
            },
            {
                q: "What payment methods do you accept?",
                a: "We accept all major credit and debit cards (Visa, Mastercard, American Express) through our secure Stripe gateway. We also offer Klarna, Swish, Google Pay, and Apple Pay. All transactions are encrypted and secure."
            },
            {
                q: "Do I need an account to place an order?",
                a: "No, you can check out as a guest. However, creating an account lets you view order history, save your address for faster checkout, and receive exclusive first-purchase offers and promotions."
            },
            {
                q: "Can I order groceries through WhatsApp?",
                a: "Yes! You can place orders via WhatsApp directly from product pages, cart, or checkout. Join our WhatsApp Group by scanning the QR code in the footer section for easy ordering and updates."
            },
            {
                q: "Do you offer discounts?",
                a: "Yes! We're one of Stockholm's most competitively priced stores for Indian and Pakistani groceries. Check our special offers page weekly for the latest promotions and deals."
            },
        ]
    },
    {
        category: "Delivery & Shipping",
        questions: [
            {
                q: "Do you deliver Indian groceries in Stockholm?",
                a: "Absolutely! We offer our own local delivery service across all of Stockholm. We're proud to be a premier indisk mataffär offering matleverans i Stockholm. Visit our Delivery Information page for full details."
            },
            {
                q: "Is there free delivery in Stockholm?",
                a: "Yes! FREE local delivery on all orders of 500 kr or more anywhere in Stockholm. Orders between 300-499 kr have a flat 30 kr delivery fee."
            },
            {
                q: "Do you deliver to the rest of Sweden?",
                a: "Yes! We deliver nationwide using our trusted partner, DHL. Shipping costs are calculated automatically at checkout based on weight and your delivery address."
            },
            {
                q: "Do you deliver to other countries in Europe?",
                a: "Yes! We deliver across Europe (excluding fresh and perishable items) via DHL. Shipping costs are calculated automatically at checkout based on weight and destination."
            },
            {
                q: "Will I have to pay customs duties in EU countries?",
                a: "No. Since we're shipping from Sweden (an EU member) to other EU countries, there are no additional customs or import duties. The checkout price is your final price. (Standard import rules apply for non-EU countries like Norway.)"
            },
        ]
    },
    {
        category: "Our Products",
        questions: [
            {
                q: "What happens if an item I ordered is out of stock?",
                a: "We operate a busy physical store, and sometimes items may sell out before our online inventory updates. If this happens, we'll contact you immediately with the option of a full refund or a suitable replacement product."
            },
            {
                q: "How do you ensure the freshness of vegetables and frozen items?",
                a: "Freshness is our priority. Fresh produce and frozen goods are currently only available for our local Stockholm delivery service. This ensures a controlled cold chain from our store to your door."
            },
            {
                q: "I'm looking for a specific brand or product not on your website.",
                a: "We're always expanding our range! If there's a specific brand or item you'd love to see, email us at info@ideallivs.com. We value your suggestions!"
            },
            {
                q: "What grocery brands do you stock?",
                a: "We carry over 150 brands from around the world, specializing in authentic Indian and Pakistani products, plus select Swedish and European brands."
            },
        ]
    },
    {
        category: "Returns & Refunds",
        questions: [
            {
                q: "What is your return policy?",
                a: "We accept returns on non-perishable items within 14 days of receipt, provided they're unopened, unused, and in original packaging. Perishable items (fresh produce, frozen goods) are not eligible for return. Read our complete Refund and Return Policy for full details."
            },
        ]
    },
    {
        category: "Physical Store Location",
        questions: [
            {
                q: "Do you have a physical store?",
                a: "Yes! Visit us at Bandhagsplan 4, 12432 Bandhagen Centrum, Stockholm. Find us on Apple Maps and Google Maps."
            },
            {
                q: "What are your store hours?",
                a: "Monday-Friday: 10:00 AM - 7:00 PM, Saturday: 10:00 AM - 6:00 PM, Sunday: 11:00 AM - 5:00 PM. Hours may vary on holidays."
            },
        ]
    },
];

export default function FAQPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary/5 via-background to-background border-b">
                <div className="container mx-auto px-4 py-16 md:py-20">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 tracking-tight">
                            Frequently Asked Questions
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Everything you need to know about ordering authentic Indian and Pakistani groceries in Stockholm. Can't find your answer? We're here to help.
                        </p>
                    </div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* FAQ Categories */}
                        <div className="lg:col-span-2">
                            <div className="space-y-12">
                                {faqs.map((category, idx) => (
                                    <div key={idx}>
                                        <h2 className="text-2xl font-heading font-semibold mb-6 tracking-tight">
                                            {category.category}
                                        </h2>
                                        <Accordion type="single" collapsible className="space-y-4">
                                            {category.questions.map((faq, qIdx) => (
                                                <AccordionItem
                                                    key={qIdx}
                                                    value={`${idx}-${qIdx}`}
                                                    className="border rounded-lg px-6 bg-card"
                                                >
                                                    <AccordionTrigger className="text-left hover:no-underline py-4">
                                                        <span className="font-medium">{faq.q}</span>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="text-muted-foreground pb-4">
                                                        {faq.a}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar - Contact Info */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                <div className="border rounded-lg p-6 bg-card">
                                    <h3 className="text-lg font-heading font-semibold mb-4">
                                        Still have questions?
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-6">
                                        Can't find the answer you're looking for? Our customer support team is ready to help.
                                    </p>
                                    <div className="space-y-4">
                                        <a
                                            href="https://wa.me/46728494801"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                                        >
                                            <MessageCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium group-hover:text-primary transition-colors">WhatsApp</p>
                                                <p className="text-xs text-muted-foreground">Chat with us instantly</p>
                                            </div>
                                        </a>
                                        <a
                                            href="mailto:info@ideallivs.com"
                                            className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                                        >
                                            <Mail className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium group-hover:text-primary transition-colors">Email</p>
                                                <p className="text-xs text-muted-foreground">info@ideallivs.com</p>
                                            </div>
                                        </a>
                                        <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                                            <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium">Visit Our Store</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Bandhagsplan 4<br />
                                                    12432 Bandhagen Centrum<br />
                                                    Stockholm
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border rounded-lg p-6 bg-primary/5">
                                    <h3 className="text-lg font-heading font-semibold mb-2">
                                        New Customer?
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Create an account for exclusive offers and faster checkout.
                                    </p>
                                    <Link
                                        href="/shop"
                                        className="inline-block w-full text-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                                    >
                                        Start Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
