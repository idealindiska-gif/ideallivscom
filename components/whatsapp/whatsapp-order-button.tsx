/**
 * WhatsApp Order Button
 * Main component for initiating WhatsApp orders from product pages or cart
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';
import { WhatsAppCustomerModal } from './whatsapp-customer-modal';
import { createWhatsAppOrderAction } from '@/app/actions/whatsapp-order';
import type { Product, ProductVariation } from '@/types/woocommerce';
import type { CartItem } from '@/store/cart-store';
import type {
  WhatsAppCustomerData,
  WhatsAppShippingAddress,
  WhatsAppBillingAddress,
} from '@/types/whatsapp';
import { useToast } from '@/hooks/use-toast';
import { isWhatsAppEnabledForProduct, getProductWhatsAppMessage } from '@/lib/whatsapp/product-helpers';

export interface WhatsAppOrderButtonProps {
  // Context: product or cart
  context: 'product' | 'cart';

  // Product data (if context = 'product')
  product?: Product;
  variation?: ProductVariation;
  quantity?: number;

  // Cart data (if context = 'cart')
  cartItems?: CartItem[];
  cartTotal?: string;
  cartSubtotal?: string;
  cartShipping?: string;
  cartTax?: string;

  // Styling
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;

  // Labels
  label?: string;
  loadingLabel?: string;

  // Customer data (pre-filled, optional)
  customerData?: Partial<WhatsAppCustomerData>;
  shippingData?: Partial<WhatsAppShippingAddress>;
  billingData?: Partial<WhatsAppBillingAddress>;

  // Whether to require customer info modal
  requireCustomerInfo?: boolean;

  // Callbacks
  onSuccess?: (orderId: number, whatsappUrl: string) => void;
  onError?: (error: string) => void;
}

export function WhatsAppOrderButton({
  context,
  product,
  variation,
  quantity = 1,
  cartItems = [],
  cartTotal,
  cartSubtotal,
  cartShipping,
  cartTax,
  variant = 'outline',
  size = 'lg',
  className = '',
  label,
  loadingLabel = 'Creating Order...',
  customerData,
  shippingData,
  billingData,
  requireCustomerInfo = true,
  onSuccess,
  onError,
}: WhatsAppOrderButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if WhatsApp is enabled for product
  if (context === 'product' && product && !isWhatsAppEnabledForProduct(product)) {
    return null; // Don't render button if disabled for product
  }

  // Determine button label
  const buttonLabel = label || (context === 'product' ? 'Order via WhatsApp' : 'WhatsApp Order');

  // Handle button click
  const handleClick = () => {
    if (context === 'product' && !product) {
      toast({
        title: 'Error',
        description: 'Product information is missing',
        variant: 'destructive',
      });
      return;
    }

    if (context === 'cart' && cartItems.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to your cart first',
        variant: 'destructive',
      });
      return;
    }

    // If customer info is required, open modal
    if (requireCustomerInfo) {
      setIsModalOpen(true);
    } else {
      // If customer data is already available, create order directly
      if (!customerData || !shippingData) {
        toast({
          title: 'Missing Information',
          description: 'Customer and shipping information is required',
          variant: 'destructive',
        });
        return;
      }
      handleCreateOrder({
        customer: customerData as WhatsAppCustomerData,
        shipping: shippingData as WhatsAppShippingAddress,
        billing: billingData as WhatsAppBillingAddress | undefined,
      });
    }
  };

  // Handle order creation
  const handleCreateOrder = async (data: {
    customer: WhatsAppCustomerData;
    shipping: WhatsAppShippingAddress;
    billing?: WhatsAppBillingAddress;
    notes?: string;
  }) => {
    setIsLoading(true);

    try {
      // Build order data based on context
      const orderData =
        context === 'product'
          ? {
              product: {
                id: product!.id,
                name: product!.name,
                slug: product!.slug,
                price: variation?.price || product!.price,
                quantity,
                variation,
              },
              customer: data.customer,
              shipping: data.shipping,
              billing: data.billing,
              notes: data.notes,
            }
          : {
              cart: {
                items: cartItems.map((item) => ({
                  productId: item.product.id,
                  variationId: item.variation?.id,
                  quantity: item.quantity,
                  name: item.product.name,
                  price: item.price.toString(),
                  variation: item.variation?.attributes
                    ?.map((attr) => attr.option)
                    .join(', '),
                })),
                total: cartTotal || '0',
                subtotal: cartSubtotal,
                shipping: cartShipping,
                tax: cartTax,
              },
              customer: data.customer,
              shipping: data.shipping,
              billing: data.billing,
              notes: data.notes,
            };

      // Create order via server action
      const result = await createWhatsAppOrderAction(orderData);

      if (result.success && result.whatsappUrl) {
        // Close modal
        setIsModalOpen(false);

        // Show success message
        toast({
          title: 'Order Created!',
          description: `Order #${result.orderNumber} has been created. Opening WhatsApp...`,
        });

        // Call success callback
        if (onSuccess) {
          onSuccess(result.orderId!, result.whatsappUrl);
        }

        // Open WhatsApp in new tab
        window.open(result.whatsappUrl, '_blank');
      } else {
        // Show error message
        toast({
          title: 'Order Failed',
          description: result.error || 'Failed to create order',
          variant: 'destructive',
        });

        // Call error callback
        if (onError) {
          onError(result.error || 'Failed to create order');
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleClick}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingLabel}
          </>
        ) : (
          <>
            <MessageCircle className="mr-2 h-4 w-4" />
            {buttonLabel}
          </>
        )}
      </Button>

      {requireCustomerInfo && (
        <WhatsAppCustomerModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSubmit={handleCreateOrder}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
