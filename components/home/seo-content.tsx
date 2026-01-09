'use client';

import { motion } from 'framer-motion';

export function SeoContent() {
    return (
        <section className="w-full py-16 border-t border-border/50">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="space-y-6"
                    >
                        <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                            Your Premier Destination for <span className="text-primary">Indian & Pakistani Groceries</span> in Stockholm
                        </h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Based in the heart of Bandhagen, <strong>Ideal Indiska LIVS</strong> is more than just a grocery store – we are a bridge to the rich culinary traditions of South Asia. Since our founding, we have been dedicated to providing the Stockholm community with the most authentic, high-quality ingredients available.
                        </p>
                        <p className="text-muted-foreground leading-relaxed">
                            Whether you are looking for premium <strong>Basmati Rice</strong>, aromatic <strong>Garam Masala</strong>, or specialty <strong>Halal Meat</strong>, our shelves are stocked with the brands you know and trust. From <em>Shan</em> and <em>National Foods</em> to <em>Haldiram&apos;s</em> and <em>Ashoka</em>, we bring the taste of home to Sweden.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="bg-card border border-border/50 p-8 rounded-3xl shadow-sm space-y-4"
                    >
                        <h3 className="text-xl font-bold font-heading">Why Stockholm Chooses Ideal Indiska LIVS</h3>
                        <ul className="space-y-4">
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span>
                                <p className="text-sm text-muted-foreground"><strong>Unmatched Freshness:</strong> Our fresh produce and vegetables are restocked daily to ensure the highest quality for your kitchen.</p>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">2</span>
                                <p className="text-sm text-muted-foreground"><strong>European-Wide Delivery:</strong> Not in Stockholm? No problem. We ship our authentic pantry staples across all of Europe via DHL.</p>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">3</span>
                                <p className="text-sm text-muted-foreground"><strong>Customer-First Service:</strong> Our team is passionate about South Asian cuisine and is always here to help you find the right ingredients for your next masterpiece.</p>
                            </li>
                            <li className="flex gap-4">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">4</span>
                                <p className="text-sm text-muted-foreground"><strong>Secure Online Shopping:</strong> Enjoy a seamless, mobile-friendly shopping experience with secure payments via Klarna, Swish, and Stripe.</p>
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
