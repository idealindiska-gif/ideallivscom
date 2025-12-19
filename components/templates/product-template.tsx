"use client";

import { ReactNode, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumbs, BreadcrumbItem } from '@/components/layout/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from '@/components/shop/add-to-cart-button';
import { ProductGrid } from '@/components/shop/product-grid';
import { ProductImageGallery } from '@/components/shop/product-image-gallery';
import { ProductVariationSelector } from '@/components/shop/product-variation-selector';
import { ProductTabs } from '@/components/shop/product-tabs';
import { ProductSchema } from '@/components/shop/product-schema';
import { StockIndicator } from '@/components/shop/stock-indicator';
import { QuantitySelector } from '@/components/shop/quantity-selector';
import { ProductRecommendations } from '@/components/ai/product-recommendations';
import { formatPrice, getDiscountPercentage } from '@/lib/woocommerce';
import { decodeHtmlEntities } from '@/lib/utils';
import { trackViewContent } from '@/lib/analytics';
import type { Product, ProductReview, ProductVariation } from '@/types/woocommerce';

interface ProductTemplateProps {
  product: Product;
  breadcrumbs?: BreadcrumbItem[];
  relatedProducts?: Product[];
  reviews?: ProductReview[];
  additionalContent?: ReactNode;
}

export function ProductTemplate({
  product,
  breadcrumbs,
  relatedProducts = [],
  reviews = [],
  additionalContent,
}: ProductTemplateProps) {
  const discount = getDiscountPercentage(product);
  const hasVariations = product.type === 'variable' && product.variations.length > 0;
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [isLoadingVariations, setIsLoadingVariations] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Track product view event
  useEffect(() => {
    trackViewContent(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  // Fetch variations if product has them
  useEffect(() => {
    if (hasVariations) {
      console.log('🔍 Fetching variations for product:', product.id);
      setIsLoadingVariations(true);
      fetch(`/api/products/${product.id}/variations`)
        .then(res => res.json())
        .then(data => {
          console.log('✅ Received variations:', data);
          console.log('📋 Product attributes:', product.attributes);
          setVariations(data);
          setIsLoadingVariations(false);
        })
        .catch(err => {
          console.error('❌ Failed to fetch variations:', err);
          setIsLoadingVariations(false);
        });
    }
  }, [hasVariations, product.id, product.attributes]);

  return (
    <>
      {/* SEO Schema */}
      <ProductSchema product={product} reviews={reviews} />

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-screen-2xl py-8 md:py-12">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs items={breadcrumbs} className="mb-6" />
          )}

          {/* Product Content - 3 Column Layout (Always in One Row) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Column 1: Related Products (LEFT) - Hidden on mobile, visible on large screens */}
            {relatedProducts && relatedProducts.length > 0 && (
              <div className="hidden lg:block lg:col-span-3">
                <div className="sticky top-24 space-y-4">
                  <h3 className="text-lg font-semibold text-primary border-b border-primary/10 pb-3">
                    You May Also Like
                  </h3>
                  <div className="space-y-3">
                    {relatedProducts.slice(0, 4).map((relatedProduct) => (
                      <a
                        key={relatedProduct.id}
                        href={`/product/${relatedProduct.slug}`}
                        className="group block bg-background border border-border hover:border-primary/30 rounded-lg p-3 transition-all duration-300 hover:shadow-md"
                      >
                        <div className="flex gap-3">
                          {/* Product Image */}
                          <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                            {relatedProduct.images && relatedProduct.images[0] ? (
                              <Image
                                src={relatedProduct.images[0].src}
                                alt={relatedProduct.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="80px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                No Image
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                              {decodeHtmlEntities(relatedProduct.name)}
                            </h4>
                            <div className="mt-1">
                              {relatedProduct.on_sale && relatedProduct.sale_price && relatedProduct.sale_price !== '' ? (
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-sm font-bold text-primary">
                                    {formatPrice(relatedProduct.sale_price, 'SEK')}
                                  </span>
                                  <span className="text-xs text-muted-foreground line-through">
                                    {formatPrice(relatedProduct.regular_price, 'SEK')}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm font-bold text-primary">
                                  {formatPrice(relatedProduct.price, 'SEK')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Column 2: Product Images (CENTER) */}
            <div className={relatedProducts && relatedProducts.length > 0 ? "lg:col-span-5" : "lg:col-span-6"}>
              <ProductImageGallery
                images={product.images || []}
                productName={product.name}
              />
            </div>

            {/* Column 3: Product Info (RIGHT) */}
            <div className={relatedProducts && relatedProducts.length > 0 ? "lg:col-span-4 space-y-5" : "lg:col-span-6 space-y-5"}>
              {/* Categories & Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {product.categories && product.categories.length > 0 && (
                  <>
                    {product.categories.map((category) => (
                      <Badge key={category.id} variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20">
                        {decodeHtmlEntities(category.name)}
                      </Badge>
                    ))}
                  </>
                )}
                {product.featured && (
                  <Badge className="bg-secondary text-primary">
                    ⭐ Featured
                  </Badge>
                )}
                {product.on_sale && discount > 0 && (
                  <Badge variant="destructive">
                    -{discount}% OFF
                  </Badge>
                )}
              </div>

              {/* Title & SKU */}
              <div>
                {/* Brand Display using WooCommerce Brands */}
                {product.brands && product.brands.length > 0 && (
                  <div className="mb-3">
                    {product.brands.map((brand) => (
                      <Link
                        key={brand.id}
                        href={`/brand/${brand.slug}`}
                        className="inline-flex items-center gap-3 group"
                      >
                        {typeof brand.image === 'object' && brand.image?.src ? (
                          <div className="relative w-12 h-12 bg-white rounded-full border border-border p-1 overflow-hidden shadow-sm group-hover:border-primary/50 transition-colors">
                            <Image
                              src={brand.image.src}
                              alt={brand.name}
                              fill
                              className="object-contain"
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <Badge variant="secondary" className="text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
                            {decodeHtmlEntities(brand.name)}
                          </Badge>
                        )}
                        {typeof brand.image === 'object' && brand.image?.src && (
                          <span className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                            {decodeHtmlEntities(brand.name)}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}

                <h1 className="font-heading text-2xl md:text-3xl lg:text-4xl font-semibold text-primary">
                  {decodeHtmlEntities(product.name)}
                </h1>
                {product.sku && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    SKU: {product.sku}
                  </p>
                )}

                {/* Rating */}
                {product.rating_count > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={
                            i < Math.floor(parseFloat(product.average_rating))
                              ? 'text-secondary text-lg'
                              : 'text-muted-foreground/30 text-lg'
                          }
                        >
                          ★
                        </span>
                      ))}
                      <span className="ml-2 text-sm font-medium text-primary">
                        {product.average_rating}
                      </span>
                      <span className="ml-1 text-sm text-muted-foreground">
                        ({product.rating_count} {product.rating_count === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 border-y border-primary/10 py-4">
                {(() => {
                  // Use selected variation price if available, otherwise use product price
                  const displayPrice = selectedVariation?.price || product.price;
                  const displayRegularPrice = selectedVariation?.regular_price || product.regular_price;
                  const displaySalePrice = selectedVariation?.sale_price || product.sale_price;

                  // Only consider on sale if there's actually a sale price value
                  const isOnSale = (selectedVariation
                    ? selectedVariation.on_sale && displaySalePrice && displaySalePrice !== ''
                    : product.on_sale && displaySalePrice && displaySalePrice !== '');

                  // Convert to string first to handle both number and string types
                  const priceStr = String(displayPrice || '0');
                  const priceValue = parseFloat(priceStr);
                  const showPricePrompt = hasVariations && !selectedVariation && priceValue === 0;

                  if (showPricePrompt) {
                    return (
                      <div className="flex flex-col gap-2">
                        <span className="text-lg font-medium text-muted-foreground">
                          Please select options to see price
                        </span>
                      </div>
                    );
                  }

                  return isOnSale ? (
                    <>
                      <span className="text-4xl font-bold font-heading text-primary">
                        {formatPrice(displaySalePrice, 'SEK')}
                      </span>
                      <span className="text-xl text-muted-foreground line-through">
                        {formatPrice(displayRegularPrice, 'SEK')}
                      </span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold font-heading text-primary">
                      {formatPrice(priceStr, 'SEK')}
                    </span>
                  );
                })()}
              </div>

              {/* Stock Status */}
              <StockIndicator
                product={selectedVariation || product}
                variant="detailed"
              />

              {/* Short Description */}
              {product.short_description && (
                <div
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              )}

              {/* Product Variations */}
              {hasVariations && (
                <div>
                  {isLoadingVariations ? (
                    <div className="py-4 text-sm text-muted-foreground">Loading options...</div>
                  ) : (
                    <ProductVariationSelector
                      product={product}
                      variations={variations}
                      onVariationChange={(variation) => {
                        console.log('Selected variation:', variation);
                        setSelectedVariation(variation);
                      }}
                    />
                  )}
                </div>
              )}

              {/* Add to Cart Section */}
              <div className="space-y-4 bg-primary/5 rounded-2xl p-6">
                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-primary">Quantity:</span>
                  <QuantitySelector
                    initialQuantity={1}
                    min={1}
                    max={selectedVariation?.stock_quantity || product.stock_quantity || 99}
                    onChange={setQuantity}
                  />
                </div>

                {/* Add to Cart Button */}
                <AddToCartButton
                  product={product}
                  variation={selectedVariation}
                  quantity={quantity}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-6 text-lg font-medium"
                />

                {/* Additional Info */}
                <div className="space-y-1 text-sm text-muted-foreground">
                  {product.shipping_required && (
                    <p className="flex items-center gap-2">
                      <span>📦</span> Shipping calculated at checkout
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <span>🚚</span> Free shipping on orders over 500 SEK
                  </p>
                </div>
              </div>

              {/* Product Meta */}
              {product.tags && product.tags.length > 0 && (
                <div className="border-t border-primary/10 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-primary">Tags:</span>
                    {product.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" className="text-xs border-primary/20">
                        {decodeHtmlEntities(tag.name)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Product Info */}
              {additionalContent}
            </div>
          </div>

          {/* Product Tabs */}
          <div className="mt-12 md:mt-16">
            <ProductTabs product={product} reviews={reviews} />
          </div>
        </div>
      </div>



      {/* AI-Powered Recommendations */}
      <div className="bg-primary/5 py-16">
        <div className="container px-4 md:px-6">
          <ProductRecommendations currentProduct={product} maxRecommendations={4} />
        </div>
      </div>
    </>
  );
}
