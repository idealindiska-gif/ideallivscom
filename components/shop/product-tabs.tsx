'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductReviews, type ReviewFormData } from './product-reviews';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Product, ProductReview } from '@/types/woocommerce';

interface ProductTabsProps {
  product: Product;
  reviews?: ProductReview[];
  onSubmitReview?: (review: ReviewFormData) => Promise<void>;
}

export function ProductTabs({ product, reviews = [], onSubmitReview }: ProductTabsProps) {
  const hasDescription = product.description && product.description.trim() !== '';
  const hasAdditionalInfo = hasProductAdditionalInfo(product);
  const hasReviews = reviews.length > 0 || product.reviews_allowed;

  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
        {hasDescription && (
          <TabsTrigger value="description">Description</TabsTrigger>
        )}
        {hasAdditionalInfo && (
          <TabsTrigger value="additional-info">
            Additional Information
          </TabsTrigger>
        )}
      </TabsList>

      {/* Description Tab */}
      {
        hasDescription && (
          <TabsContent value="description" className="mt-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content (65%) */}
              <div className="w-full lg:w-[65%]">
                <style jsx>{`
                  .prose :global(h2) {
                    font-size: 20px !important;
                    font-weight: 400 !important;
                  }
                `}</style>
                <div
                  className="prose max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>

              {/* Reviews Sidebar (35%) - Always visible if reviews exist */}
              <div className="w-full lg:w-[35%] lg:border-l lg:pl-8">
                <div className="sticky top-24">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    Customer Reviews
                    {product.rating_count > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {product.rating_count}
                      </Badge>
                    )}
                  </h3>
                  <ProductReviews
                    productId={product.id}
                    reviews={reviews}
                    averageRating={product.average_rating}
                    ratingCount={product.rating_count}
                    onSubmitReview={onSubmitReview}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        )
      }

      {/* Additional Information Tab */}
      {
        hasAdditionalInfo && (
          <TabsContent value="additional-info" className="mt-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Main Content (65%) */}
              <div className="w-full lg:w-[65%]">
                <div className="overflow-hidden rounded-lg border">
                  <table className="w-full">
                    <tbody className="divide-y">
                      {/* SKU */}
                      {product.sku && (
                        <tr className="transition-colors hover:bg-muted/50">
                          <td className="px-6 py-3 font-semibold">SKU</td>
                          <td className="px-6 py-3">{product.sku}</td>
                        </tr>
                      )}

                      {/* Weight */}
                      {product.weight && (
                        <tr className="transition-colors hover:bg-muted/50">
                          <td className="px-6 py-3 font-semibold">Weight</td>
                          <td className="px-6 py-3">{product.weight} kg</td>
                        </tr>
                      )}

                      {/* Dimensions */}
                      {product.dimensions && hasDimensions(product.dimensions) && (
                        <tr className="transition-colors hover:bg-muted/50">
                          <td className="px-6 py-3 font-semibold">Dimensions</td>
                          <td className="px-6 py-3">
                            {product.dimensions.length} × {product.dimensions.width} ×{' '}
                            {product.dimensions.height} cm
                          </td>
                        </tr>
                      )}

                      {/* Categories */}
                      {product.categories && product.categories.length > 0 && (
                        <tr className="transition-colors hover:bg-muted/50">
                          <td className="px-6 py-3 font-semibold">Categories</td>
                          <td className="px-6 py-3">
                            {product.categories.map((cat) => cat.name).join(', ')}
                          </td>
                        </tr>
                      )}

                      {/* Tags */}
                      {product.tags && product.tags.length > 0 && (
                        <tr className="transition-colors hover:bg-muted/50">
                          <td className="px-6 py-3 font-semibold">Tags</td>
                          <td className="px-6 py-3">
                            {product.tags.map((tag) => tag.name).join(', ')}
                          </td>
                        </tr>
                      )}

                      {/* Stock Status */}
                      <tr className="transition-colors hover:bg-muted/50">
                        <td className="px-6 py-3 font-semibold">Stock Status</td>
                        <td className="px-6 py-3">
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
                        </td>
                      </tr>

                      {/* Stock Quantity */}
                      {product.manage_stock && product.stock_quantity !== null && (
                        <tr className="transition-colors hover:bg-muted/50">
                          <td className="px-6 py-3 font-semibold">Available Quantity</td>
                          <td className="px-6 py-3">{product.stock_quantity} units</td>
                        </tr>
                      )}

                      {/* Product Attributes */}
                      {product.attributes &&
                        product.attributes.map((attr) => (
                          <tr key={attr.id || attr.name} className="transition-colors hover:bg-muted/50">
                            <td className="px-6 py-3 font-semibold">{attr.name}</td>
                            <td className="px-6 py-3">
                              {attr.options ? attr.options.join(', ') : 'N/A'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Reviews Sidebar (35%) - Repeats here so it's visible on this tab too */}
              <div className="w-full lg:w-[35%] lg:border-l lg:pl-8">
                <div className="sticky top-24">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    Customer Reviews
                    {product.rating_count > 0 && (
                      <Badge variant="secondary" className="ml-1">
                        {product.rating_count}
                      </Badge>
                    )}
                  </h3>
                  <ProductReviews
                    productId={product.id}
                    reviews={reviews}
                    averageRating={product.average_rating}
                    ratingCount={product.rating_count}
                    onSubmitReview={onSubmitReview}
                    compact={true}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        )
      }

    </Tabs >
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
