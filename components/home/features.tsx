'use client';

import { Truck, ShieldCheck, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
    {
        icon: Truck,
        title: 'Free Delivery',
        description: 'Free shipping on orders over 500 SEK within Stockholm. Fast & reliable delivery to your doorstep.',
    },
    {
        icon: Award,
        title: 'Halal Certified',
        description: 'A wide range of 100% Halal certified meat and meat products, ensuring quality and trust.',
    },
    {
        icon: ShieldCheck,
        title: 'Authentic Brands',
        description: 'Sourced directly from top Indian & Pakistani brands like Haldiram, National Foods, and Shan.',
    },
    {
        icon: Clock,
        title: 'Fresh Produce',
        description: 'Daily restock of fresh vegetables, exotic fruits, and traditional Asian ingredients.',
    },
];

export function Features() {
    return (
        <section className="w-full py-12 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 md:px-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex flex-col items-center text-center space-y-3 p-6 rounded-2xl bg-card border border-border/50 hover:shadow-md transition-all"
                        >
                            <div className="p-3 rounded-full bg-primary/10 text-primary">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold font-heading">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
