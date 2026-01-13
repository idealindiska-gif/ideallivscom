"use client";

import { ReactNode, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Breadcrumbs, BreadcrumbItem } from '@/components/layout/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddToCartButton } from '@/components/shop/add-to-cart-button';
import { Plus } from 'lucide-react';
import { ProductGrid } from '@/components/shop/product-grid';
import { ProductImageGallery } from '@/components/shop/product-image-gallery';
import { ProductVariationSelector } from '@/components/shop/product-variation-selector';
import { ProductReviews } from '@/components/shop/product-reviews';
import { ProductSchema } from '@/components/shop/product-schema';
import { StockIndicator } from '@/components/shop/stock-indicator';
import { QuantitySelector } from '@/components/shop/quantity-selector';
import { ProductRecommendations } from '@/components/ai/product-recommendations';
import { StripeExpressCheckout } from '@/components/checkout/stripe-express-checkout';
import { WishlistButton } from '@/components/wishlist/wishlist-button';
import { WhatsAppOrderButton } from '@/components/whatsapp/whatsapp-order-button';
import { formatPrice, getDiscountPercentage } from '@/lib/woocommerce';
import { decodeHtmlEntities } from '@/lib/utils';
import { trackViewContent } from '@/lib/analytics';
import { CommerceRules } from '@/config/commerce-rules';
import { useCartStore } from '@/store/cart-store';
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

  // Monitor selectedVariation changes
  useEffect(() => {
    console.log('🔄 selectedVariation state changed to:', selectedVariation);
  }, [selectedVariation]);

  return (
    <>
      {/* SEO Schema */}
      <ProductSchema product={product} reviews={reviews} />

      <div className="min-h-screen bg-background overflow-x-hidden max-w-full">
        <div className="w-full px-2.5 md:px-[30px] py-6 md:py-8 max-w-full">
          {/* Breadcrumbs */}
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs items={breadcrumbs} className="mb-4" />
          )}

          {/* Product Content - 3 Column Layout (Always in One Row) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
            {/* Column 1: Related Products (LEFT) - Last on mobile, first on desktop */}
            {relatedProducts && relatedProducts.length > 0 && (
              <div className="lg:col-span-3 order-3 lg:order-1">
                <div className="lg:sticky lg:top-24 space-y-3">
                  <h3 style={{ fontSize: '18px', fontWeight: 600, lineHeight: 1.52, letterSpacing: '0.025em' }} className="text-foreground border-b border-border/50 pb-2">
                    You May Also Like
                  </h3>
                  {/* Desktop: Vertical list */}
                  <div className="hidden lg:block space-y-3">
                    {relatedProducts.slice(0, 4).map((relatedProduct) => (
                      <div
                        key={relatedProduct.id}
                        className="group relative bg-background border border-border hover:border-primary/30 rounded-lg p-3 transition-all duration-300 hover:shadow-md"
                      >
                        <a href={`/product/${relatedProduct.slug}`} className="flex gap-3">
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
                            <h4 style={{ fontSize: '15px', fontWeight: 500, lineHeight: 1.57, letterSpacing: '0.02em' }} className="text-foreground line-clamp-2 group-hover:text-foreground/70 transition-colors">
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
                        </a>
                        {/* Add to Cart Plus Button */}
                        <Button
                          size="icon"
                          className="absolute bottom-3 right-3 h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:scale-105 transition-all"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            // Check if product has variations
                            const hasVariations = relatedProduct.type === 'variable' &&
                              relatedProduct.variations &&
                              relatedProduct.variations.length > 0;

                            if (hasVariations) {
                              // Redirect to product page to select variations
                              window.location.href = `/product/${relatedProduct.slug}`;
                            } else {
                              // Add simple product directly to cart
                              const cartStore = useCartStore.getState();
                              cartStore.addItem(relatedProduct, 1);
                            }
                          }}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  {/* Mobile: 2 per row grid */}
                  <div className="grid grid-cols-2 gap-3 lg:hidden">
                    {relatedProducts.slice(0, 4).map((relatedProduct) => (
                      <div
                        key={relatedProduct.id}
                        className="group relative bg-background border border-border hover:border-primary/30 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md"
                      >
                        <a href={`/product/${relatedProduct.slug}`} className="block">
                          {/* Product Image */}
                          <div className="relative aspect-square overflow-hidden bg-muted">
                            {relatedProduct.images && relatedProduct.images[0] ? (
                              <Image
                                src={relatedProduct.images[0].src}
                                alt={relatedProduct.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 50vw, 25vw"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                No Image
                              </div>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="p-2">
                            <h4 className="text-xs font-medium text-foreground line-clamp-2 mb-1">
                              {decodeHtmlEntities(relatedProduct.name)}
                            </h4>
                            <div>
                              {relatedProduct.on_sale && relatedProduct.sale_price && relatedProduct.sale_price !== '' ? (
                                <div className="flex items-baseline gap-1">
                                  <span className="text-sm font-semibold text-primary">
                                    {formatPrice(relatedProduct.sale_price, 'SEK')}
                                  </span>
                                  <span className="text-xs text-muted-foreground line-through">
                                    {formatPrice(relatedProduct.regular_price, 'SEK')}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm font-semibold text-primary">
                                  {formatPrice(relatedProduct.price, 'SEK')}
                                </span>
                              )}
                            </div>
                          </div>
                        </a>
                        {/* Add to Cart Plus Button */}
                        <Button
                          size="icon"
                          className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:scale-105 transition-all z-10"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            // Check if product has variations
                            const hasVariations = relatedProduct.type === 'variable' &&
                              relatedProduct.variations &&
                              relatedProduct.variations.length > 0;

                            if (hasVariations) {
                              // Redirect to product page to select variations
                              window.location.href = `/product/${relatedProduct.slug}`;
                            } else {
                              // Add simple product directly to cart
                              const cartStore = useCartStore.getState();
                              cartStore.addItem(relatedProduct, 1);
                            }
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Column 2: Product Images (CENTER) - First on mobile */}
            <div className={relatedProducts && relatedProducts.length > 0 ? "lg:col-span-5 order-1 lg:order-2" : "lg:col-span-6 order-1"}>
              <ProductImageGallery
                images={product.images || []}
                productName={product.name}
              />
            </div>

            {/* Column 3: Product Info (RIGHT) - Second on mobile */}
            <div className={relatedProducts && relatedProducts.length > 0 ? "lg:col-span-4 space-y-3 order-2 lg:order-3" : "lg:col-span-6 space-y-3 order-2"}>
              {/* Categories & Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {product.categories && product.categories.length > 0 && (
                  <>
                    {product.categories.map((category) => (
                      <Link key={category.id} href={`/product-category/${category.slug}`}>
                        <Badge variant="secondary" className="bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors cursor-pointer">
                          {decodeHtmlEntities(category.name)}
                        </Badge>
                      </Link>
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

                <h1 style={{ fontSize: '24px', fontWeight: 500, letterSpacing: '0px' }} className="font-heading text-foreground leading-tight">
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
                      <span className="font-heading text-primary text-2xl md:text-[27px] font-extrabold leading-tight">
                        {formatPrice(displaySalePrice, 'SEK')}
                      </span>
                      <span className="text-muted-foreground line-through text-lg md:text-2xl font-semibold">
                        {formatPrice(displayRegularPrice, 'SEK')}
                      </span>
                    </>
                  ) : (
                    <span className="font-heading text-primary text-2xl md:text-[27px] font-extrabold leading-tight">
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
                        console.log('🎯 ProductTemplate: onVariationChange called with:', variation);
                        console.log('🎯 Setting selectedVariation to:', variation?.id || 'null');
                        setSelectedVariation(variation);
                        console.log('🎯 selectedVariation state updated');
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

                {/* Add to Cart & Wishlist Buttons */}
                <div className="flex gap-3">
                  <AddToCartButton
                    product={product}
                    variation={selectedVariation}
                    quantity={quantity}
                    size="lg"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-5"
                    style={{ fontSize: '15px', fontWeight: 500, lineHeight: 1.52, letterSpacing: '0.03em' }}
                  />
                  <WishlistButton
                    product={product}
                    variation={selectedVariation || undefined}
                    size="lg"
                    variant="outline"
                    className="rounded-full py-5 px-6 border-2 hover:bg-red-50 dark:hover:bg-red-950/20"
                  />
                </div>

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

                {/* WhatsApp Order Button */}
                <WhatsAppOrderButton
                  context="product"
                  product={product}
                  variation={selectedVariation || undefined}
                  quantity={quantity}
                  requireCustomerInfo={true}
                  variant="outline"
                  size="lg"
                  className="w-full rounded-full py-5 border-2 border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20"
                  label="Order via WhatsApp"
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

          {/* Product Sections - No Tabs */}
          <div className="mt-8 md:mt-12 space-y-12">

            {/* 1. Additional Information Section - Multi-column */}
            {hasProductAdditionalInfo(product) && (
              <section className="border-t border-border pt-8">
                <h2 style={{ fontSize: '20px', fontWeight: 600 }} className="mb-6 text-foreground">
                  Additional Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* SKU */}
                  {product.sku && (
                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                      <dt className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">SKU</dt>
                      <dd className="text-base font-medium text-foreground">{product.sku}</dd>
                    </div>
                  )}

                  {/* Weight */}
                  {(selectedVariation?.weight || product.weight) && (
                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                      <dt className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Weight</dt>
                      <dd className="text-base font-medium text-foreground">
                        {(() => {
                          const weightValue = parseFloat(selectedVariation?.weight || product.weight || '0');
                          if (isNaN(weightValue) || weightValue === 0) return 'N/A';

                          // If weight is 1000 or more, display in kg, otherwise in g
                          return weightValue >= 1000
                            ? `${(weightValue / 1000).toFixed(weightValue % 1000 === 0 ? 0 : 2)} kg`
                            : `${weightValue} g`;
                        })()}
                      </dd>
                    </div>
                  )}

                  {/* Dimensions */}
                  {product.dimensions && hasDimensions(product.dimensions) && (
                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                      <dt className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Dimensions</dt>
                      <dd className="text-base font-medium text-foreground">
                        {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
                      </dd>
                    </div>
                  )}

                  {/* Stock Status */}
                  <div className="bg-muted/30 rounded-lg p-4 border border-border">
                    <dt className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Stock Status</dt>
                    <dd className="text-base font-medium">
                      <Badge
                        variant={
                          product.stock_status === 'instock'
                            ? 'default'
                            : product.stock_status === 'onbackorder'
                              ? 'secondary'
                              : 'destructive'
                        }
                      >
                        {product.stock_status === 'instock'
                          ? 'In Stock'
                          : product.stock_status === 'onbackorder'
                            ? 'Available on Backorder'
                            : 'Out of Stock'}
                      </Badge>
                    </dd>
                  </div>

                  {/* Stock Quantity */}
                  {product.manage_stock && product.stock_quantity !== null && (
                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                      <dt className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Available Quantity</dt>
                      <dd className="text-base font-medium text-foreground">{product.stock_quantity} units</dd>
                    </div>
                  )}

                  {/* Categories */}
                  {product.categories && product.categories.length > 0 && (
                    <div className="bg-muted/30 rounded-lg p-4 border border-border">
                      <dt className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Categories</dt>
                      <dd className="text-base font-medium text-foreground">
                        {product.categories.map((cat) => cat.name).join(', ')}
                      </dd>
                    </div>
                  )}

                  {/* Product Attributes */}
                  {product.attributes &&
                    product.attributes.map((attr) => (
                      <div key={attr.id || attr.name} className="bg-muted/30 rounded-lg p-4 border border-border">
                        <dt className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">{attr.name}</dt>
                        <dd className="text-base font-medium text-foreground">
                          {attr.options ? attr.options.join(', ') : 'N/A'}
                        </dd>
                      </div>
                    ))}

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="bg-muted/30 rounded-lg p-4 border border-border md:col-span-2 lg:col-span-3">
                      <dt className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Tags</dt>
                      <dd className="flex flex-wrap gap-2">
                        {product.tags.map((tag) => (
                          <Badge key={tag.id} variant="outline">
                            {decodeHtmlEntities(tag.name)}
                          </Badge>
                        ))}
                      </dd>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* 2. Description Section */}
            {product.description && product.description.trim() !== '' && (
              <section className="border-t border-border pt-8">
                <h2 style={{ fontSize: '20px', fontWeight: 600 }} className="mb-6 text-foreground">
                  Product Description
                </h2>
                <style jsx>{`
                   .prose :global(h1) { font-size: 22px !important; font-weight: 600 !important; }
                  .prose :global(h2) { font-size: 20px !important; font-weight: 500 !important; }
                  .prose :global(h3) { font-size: 18px !important; font-weight: 500 !important; }
                  .prose :global(h4) { font-size: 16px !important; font-weight: 500 !important; }
                  .prose :global(h5) { font-size: 15px !important; font-weight: 600 !important; }
                  .prose :global(h6) { font-size: 14px !important; font-weight: 600 !important; }
                  .prose :global(h1), .prose :global(h2), .prose :global(h3), .prose :global(h4), .prose :global(h5), .prose :global(h6) {
                    line-height: 1.4 !important;
                    margin-top: 1.5em !important;
                    margin-bottom: 0.75em !important;
                  }
                  .prose :global(p),
                  .prose :global(li) {
                    font-size: 15px !important;
                    font-weight: 400 !important;
                    line-height: 1.7 !important;
                  }
                  .prose :global(ul),
                  .prose :global(ol) {
                    margin-top: 1em !important;
                    margin-bottom: 1em !important;
                  }
                  .prose :global(li) {
                    margin-top: 0.5em !important;
                    margin-bottom: 0.5em !important;
                  }
                `}</style>
                <div
                  className="prose max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </section>
            )}

            {/* 3. Reviews Section */}
            <section className="border-t border-border pt-8">
              <h2 style={{ fontSize: '20px', fontWeight: 600 }} className="mb-6 text-foreground flex items-center gap-3">
                Customer Reviews
                {product.rating_count > 0 && (
                  <Badge variant="secondary" className="text-base">
                    {product.rating_count} {product.rating_count === 1 ? 'Review' : 'Reviews'}
                  </Badge>
                )}
              </h2>
              <ProductReviews
                productId={product.id}
                reviews={reviews}
                averageRating={product.average_rating}
                ratingCount={product.rating_count}
                compact={false}
              />
            </section>

          </div>
        </div>
      </div>

      {/* 4. AI-Powered Recommendations - You May Also Like */}
      <div className="bg-primary/5 py-12 border-t border-border">
        <div className="w-full px-2.5 md:px-[30px] max-w-full">
          <ProductRecommendations currentProduct={product} maxRecommendations={5} />
        </div>
      </div>
    </>
  );
}

// Helper functions
function hasProductAdditionalInfo(product: Product): boolean {
  return !!(
    product.sku ||
    product.weight ||
    (product.dimensions && hasDimensions(product.dimensions)) ||
    (product.categories && product.categories.length > 0) ||
    (product.tags && product.tags.length > 0) ||
    (product.attributes && product.attributes.length > 0)
  );
}

function hasDimensions(dimensions: { length: string; width: string; height: string }): boolean {
  return !!(dimensions.length || dimensions.width || dimensions.height);
}
