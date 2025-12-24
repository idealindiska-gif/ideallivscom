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
import { StripeExpressCheckout } from '@/components/checkout/stripe-express-checkout';
import { formatPrice, getDiscountPercentage } from '@/lib/woocommerce';
import { decodeHtmlEntities } from '@/lib/utils';
import { trackViewContent } from '@/lib/analytics';
import { CommerceRules } from '@/config/commerce-rules';
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
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-screen-2xl py-6 md:py-8">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs items={breadcrumbs} className="mb-4" />
          )}

          {/* Product Content - 3 Column Layout (Always in One Row) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Column 1: Related Products (LEFT) - Hidden on mobile, visible on large screens */}
            {relatedProducts && relatedProducts.length > 0 && (
              <div className="hidden lg:block lg:col-span-3">
                <div className="sticky top-24 space-y-3">
                  <h3 style={{ fontSize: '20px', fontWeight: 500, lineHeight: 1.52, letterSpacing: '0.025em' }} className="text-foreground border-b border-border/50 pb-2">
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
                            <h4 style={{ fontSize: '15.13px', fontWeight: 400, lineHeight: 1.57, letterSpacing: '0.03em' }} className="text-foreground line-clamp-2 group-hover:text-foreground/70 transition-colors">
                              {decodeHtmlEntities(relatedProduct.name)}
                            </h4>
                            <div className="mt-1">
                              {relatedProduct.on_sale && relatedProduct.sale_price && relatedProduct.sale_price !== '' ? (
                                <div className="flex items-baseline gap-1.5">
                                  <span style={{ fontSize: '14.31px', fontWeight: 600, lineHeight: 1.57, letterSpacing: '0.03em' }} className="text-primary">
                                    {formatPrice(relatedProduct.sale_price, 'SEK')}
                                  </span>
                                  <span style={{ fontSize: '12.8px', fontWeight: 300, lineHeight: 1.57, letterSpacing: '0.03em' }} className="text-muted-foreground line-through">
                                    {formatPrice(relatedProduct.regular_price, 'SEK')}
                                  </span>
                                </div>
                              ) : (
                                <span style={{ fontSize: '14.31px', fontWeight: 600, lineHeight: 1.57, letterSpacing: '0.03em' }} className="text-primary">
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
            <div className={relatedProducts && relatedProducts.length > 0 ? "lg:col-span-4 space-y-3" : "lg:col-span-6 space-y-3"}>
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
                          <span style={{ fontSize: '15.13px', fontWeight: 400, lineHeight: 1.57, letterSpacing: '0.03em' }} className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {decodeHtmlEntities(brand.name)}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}

                <h1 style={{ fontSize: '31.25px', fontWeight: 700, lineHeight: 1.47, letterSpacing: '0.02em' }} className="font-heading text-foreground">
                  {decodeHtmlEntities(product.name)}
                </h1>
                {product.sku && (
                  <p style={{ fontSize: '13.53px', fontWeight: 400, lineHeight: 1.57, letterSpacing: '0.03em' }} className="mt-2 text-muted-foreground">
                    SKU: {product.sku}
                  </p>
                )}

                {/* Rating */}
                {product.rating_count > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          style={{ fontSize: '16px' }}
                          className={
                            i < Math.floor(parseFloat(product.average_rating))
                              ? 'text-secondary'
                              : 'text-muted-foreground/30'
                          }
                        >
                          ★
                        </span>
                      ))}
                      <span style={{ fontSize: '14.31px', fontWeight: 500, lineHeight: 1.57, letterSpacing: '0.03em' }} className="ml-2 text-foreground">
                        {product.average_rating}
                      </span>
                      <span style={{ fontSize: '14.31px', fontWeight: 400, lineHeight: 1.57, letterSpacing: '0.03em' }} className="ml-1 text-muted-foreground">
                        ({product.rating_count} {product.rating_count === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 border-y border-border py-3">
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
                        <span style={{ fontSize: '18.91px', fontWeight: 500, lineHeight: 1.52, letterSpacing: '0.03em' }} className="text-muted-foreground">
                          Please select options to see price
                        </span>
                      </div>
                    );
                  }

                  return isOnSale ? (
                    <>
                      <span style={{ fontSize: '34.94px', fontWeight: 800, lineHeight: 1.47, letterSpacing: '0.015em' }} className="font-heading text-primary">
                        {formatPrice(displaySalePrice, 'SEK')}
                      </span>
                      <span style={{ fontSize: '22.36px', fontWeight: 600, lineHeight: 1.52, letterSpacing: '0.025em' }} className="text-muted-foreground line-through">
                        {formatPrice(displayRegularPrice, 'SEK')}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: '34.94px', fontWeight: 800, lineHeight: 1.47, letterSpacing: '0.015em' }} className="font-heading text-primary">
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
                  style={{ fontSize: '16px', fontWeight: 400, lineHeight: 1.52, letterSpacing: '0.03em' }}
                  className="max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: product.short_description }}
                />
              )}

              {/* Product Variations */}
              {hasVariations && (
                <div>
                  {isLoadingVariations ? (
                    <div style={{ fontSize: '15.13px', fontWeight: 400, lineHeight: 1.57, letterSpacing: '0.03em' }} className="py-3 text-muted-foreground">Loading options...</div>
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
              <div className="space-y-3 bg-primary/5 rounded-2xl p-5">
                {/* Quantity Selector */}
                <div className="flex items-center gap-4">
                  <span style={{ fontSize: '15.13px', fontWeight: 500, lineHeight: 1.57, letterSpacing: '0.03em' }} className="text-foreground">Quantity:</span>
                  <QuantitySelector
                    initialQuantity={1}
                    min={1}
                    max={(() => {
                      // Check commerce rules quantity limit
                      const commerceLimit = CommerceRules.getQuantityLimit(product.id);
                      const stockLimit = selectedVariation?.stock_quantity || product.stock_quantity || 99;

                      // Use the lower of commerce limit or stock limit
                      return commerceLimit !== null ? Math.min(commerceLimit, stockLimit) : stockLimit;
                    })()}
                    onChange={setQuantity}
                  />
                </div>

                {/* Quantity Limit Notice */}
                {(() => {
                  const quantityLimit = CommerceRules.getQuantityLimit(product.id);
                  if (quantityLimit !== null) {
                    return (
                      <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 px-3 py-2 rounded-lg">
                        <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span style={{ fontSize: '13.53px', fontWeight: 400 }}>
                          Limited to {quantityLimit} unit{quantityLimit > 1 ? 's' : ''} per order
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Add to Cart Button */}
                <AddToCartButton
                  product={product}
                  variation={selectedVariation}
                  quantity={quantity}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-5"
                  style={{ fontSize: '17.89px', fontWeight: 500, lineHeight: 1.52, letterSpacing: '0.03em' }}
                />

                {/* Express Checkout - Apple Pay / Google Pay (like WordPress) */}
                <StripeExpressCheckout
                  amount={parseFloat(selectedVariation?.price || product.price || '0') * quantity}
                  currency="SEK"
                  onSuccess={(result) => {
                    console.log('Express checkout success:', result);
                    // Redirect to order confirmation or handle success
                  }}
                  onError={(error) => {
                    console.error('Express checkout error:', error);
                  }}
                />

                {/* Additional Info */}
                <div style={{ fontSize: '14.31px', fontWeight: 400, lineHeight: 1.57, letterSpacing: '0.03em' }} className="space-y-1 text-muted-foreground">
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
                <div className="border-t border-border pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span style={{ fontSize: '14.31px', fontWeight: 500, lineHeight: 1.57, letterSpacing: '0.03em' }} className="text-foreground">Tags:</span>
                    {product.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline" style={{ fontSize: '12.8px', fontWeight: 300, lineHeight: 1.57, letterSpacing: '0.03em' }} className="border-border">
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
          <div className="mt-8 md:mt-10">
            <ProductTabs product={product} reviews={reviews} />
          </div>
        </div>
      </div>

      {/* AI-Powered Recommendations */}
      <div className="bg-primary/5 py-12">
        <div className="container px-4 md:px-6">
          <ProductRecommendations currentProduct={product} maxRecommendations={4} />
        </div>
      </div>
    </>
  );
}
