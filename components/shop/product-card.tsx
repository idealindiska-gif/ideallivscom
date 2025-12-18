'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types/woocommerce';
import { formatPrice, getDiscountPercentage, getVariableProductPrice, hasVariations } from '@/lib/woocommerce';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { cn, decodeHtmlEntities } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const discount = getDiscountPercentage(product);
  const { addItem, openCart } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // For variable products, redirect to product page to select variation
    if (hasVariations(product)) {
      window.location.href = `/${product.slug}`;
      return;
    }

    setIsAdding(true);

    // Add item to cart without opening the cart sidebar
    // Cart will only open when user clicks the cart icon in header
    addItem(product);

    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={cn("group relative h-full", className)}
    >
      <Link href={`/${product.slug}`} className="block h-full">
        <article className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">

          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-muted/20">
            {product.images && product.images.length > 0 && !imageError ? (
              <Image
                src={product.images[0].src}
                alt={product.images[0].alt || product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 20vw"
                priority={false}
                loading="lazy"
                onError={() => setImageError(true)}
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted/30">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShoppingBag className="h-8 w-8 opacity-50" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">No Image</span>
                </div>
              </div>
            )}

            {/* Quick Add Button (Desktop: Hover) - Clean & Minimal */}
            <div className="absolute bottom-3 right-3 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 z-10">
              <Button
                size="icon"
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:scale-105 transition-all"
                onClick={handleAddToCart}
                disabled={product.stock_status === 'outofstock' || isAdding}
              >
                {isAdding ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Plus className="h-5 w-5" />
                )}
                <span className="sr-only">Add to cart</span>
              </Button>
            </div>

            {/* Badges - Clean tags */}
            <div className="absolute left-3 top-3 flex flex-col gap-2 z-10">
              {product.featured && (
                <Badge className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm border-0">
                  <Star className="mr-1 h-3 w-3 fill-current" /> Featured
                </Badge>
              )}
              {product.on_sale && discount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm border-0">
                  -{discount}%
                </Badge>
              )}
              {product.stock_status === 'outofstock' && (
                <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                  Sold Out
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info - Minimalist White & Clean */}
          <div className="flex flex-1 flex-col p-4 bg-card">
            {/* Category */}
            {product.categories && product.categories.length > 0 && (
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground group-hover:text-primary transition-colors">
                {decodeHtmlEntities(product.categories[0].name)}
              </p>
            )}

            {/* Name */}
            <h3 className="mb-2 line-clamp-2 font-heading text-base font-bold leading-tight text-foreground transition-colors group-hover:text-primary">
              {decodeHtmlEntities(product.name)}
            </h3>

            {/* Description (Optional) */}
            {product.short_description && (
              <p className="mb-4 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                {decodeHtmlEntities(product.short_description.replace(/<[^>]*>/g, ''))}
              </p>
            )}

            <div className="mt-auto flex items-center justify-between gap-3 pt-3 border-t border-border/50">
              {/* Price */}
              <div className="flex flex-col">
                {product.on_sale && product.sale_price && product.sale_price !== '' ? (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.sale_price, 'SEK')}
                    </span>
                    <span className="text-xs text-muted-foreground line-through">
                      {formatPrice(product.regular_price, 'SEK')}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    {hasVariations(product) && product.price && parseFloat(String(product.price)) > 0 && (
                      <span className="text-xs text-muted-foreground">From</span>
                    )}
                    <span className="text-lg font-bold text-foreground">
                      {(() => {
                        const priceValue = product.price ? String(product.price) : '0';
                        return formatPrice(priceValue, 'SEK');
                      })()}
                    </span>
                  </div>
                )}
              </div>

              {/* Add to Cart Button */}
              <Button
                size="sm"
                className="shrink-0 h-8 px-3 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleAddToCart}
                disabled={product.stock_status === 'outofstock' || isAdding}
              >
                {isAdding ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span className="ml-1.5">Adding...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span className="ml-1.5">{hasVariations(product) ? 'Select' : 'Add'}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
