'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { trackAddToCart } from '@/lib/analytics';
import type { Product, ProductVariation } from '@/types/woocommerce';
import { ShoppingCart, Check } from 'lucide-react';

interface AddToCartButtonProps {
  product: Product;
  variation?: ProductVariation | null;
  quantity?: number;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function AddToCartButton({
  product,
  variation,
  quantity = 1,
  variant = 'default',
  size = 'default',
  className,
}: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { addItem, openCart } = useCartStore();

  const handleAddToCart = () => {
    // Add item to cart with variation if provided
    addItem(product, quantity, variation || undefined);

    // Track add to cart event
    trackAddToCart(product, quantity, variation?.id);

    setIsAdded(true);

    // Reset the "added" state after 2 seconds
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  // Check stock status - use variation stock if available, otherwise product stock
  const stockStatus = variation?.stock_status || product.stock_status;
  const isOutOfStock = stockStatus === 'outofstock';

  // For variable products, require variation selection
  const hasVariations = product.type === 'variable' && product.variations && product.variations.length > 0;
  const needsVariationSelection = hasVariations && !variation;

  return (
    <Button
      onClick={handleAddToCart}
      disabled={isOutOfStock || isAdded || needsVariationSelection}
      variant={variant}
      size={size}
      className={className}
    >
      {isAdded ? (
        <>
          <Check className="mr-2 h-4 w-4" />
          Added to Cart
        </>
      ) : needsVariationSelection ? (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Select Options
        </>
      ) : (
        <>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </>
      )}
    </Button>
  );
}
