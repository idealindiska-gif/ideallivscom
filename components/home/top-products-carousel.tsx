'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useAnimationFrame } from 'framer-motion';
import { formatPrice } from '@/lib/woocommerce';
import type { Product } from '@/types/woocommerce';

interface TopProductsCarouselProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export function TopProductsCarousel({ products, title = "Our Signature Dishes", subtitle = "Explore our most loved authentic Pakistani & Indian specialties, prepared fresh daily." }: TopProductsCarouselProps) {
  const [isPaused, setIsPaused] = useState(false);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Calculate total width of all items
  useEffect(() => {
    if (containerRef.current) {
      const itemWidth = 320; // Wider cards for better visibility
      const gap = 32; // More breathing room
      const totalWidth = products.length * (itemWidth + gap);
      setContainerWidth(totalWidth);
    }
  }, [products]);

  // Continuous auto-scroll animation
  useAnimationFrame((t, delta) => {
    if (isPaused || containerWidth === 0) return;
    const speed = 0.4; // Slightly slower, more elegant scroll
    const newX = x.get() - speed;

    if (Math.abs(newX) >= containerWidth / 2) {
      x.set(0);
    } else {
      x.set(newX);
    }
  });

  if (products.length === 0) return null;

  const duplicatedProducts = [...products, ...products];

  return (
    <section className="w-full py-24 bg-background border-t border-border/40">
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-primary">
            {title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-light">
            {subtitle}
          </p>
        </div>
      </div>

      <div
        className="relative overflow-hidden w-full"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

        <motion.div
          ref={containerRef}
          style={{ x }}
          className="flex gap-8 px-8"
        >
          {duplicatedProducts.map((product, index) => (
            <ProductCard key={`${product.id}-${index}`} product={product} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = product.images?.[0]?.src || '/placeholder-food.jpg';
  const cleanName = product.name.replace(/<[^>]*>/g, '').trim();

  return (
    <Link href={`/product/${product.slug}`}>
      <motion.div
        className="w-[320px] flex-shrink-0 group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -5 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative w-full h-[400px] rounded-2xl overflow-hidden bg-muted mb-4 shadow-sm group-hover:shadow-md transition-all duration-300">
          <Image
            src={imageUrl}
            alt={cleanName}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="320px"
          />

          {/* Minimal Sale Badge */}
          {product.on_sale && (
            <div className="absolute top-4 left-4 z-10">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                Sale
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2 text-center">
          <h3 className="font-heading text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {cleanName}
          </h3>

          <div className="flex items-center justify-center gap-2">
            {product.on_sale && product.sale_price ? (
              <>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(product.sale_price, 'SEK')}
                </span>
                <span className="text-sm text-muted-foreground line-through decoration-red-500/30">
                  {formatPrice(product.regular_price, 'SEK')}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price, 'SEK')}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
