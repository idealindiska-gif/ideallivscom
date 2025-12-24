'use client';

import { useCartStore } from '@/store/cart-store';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Gift, Loader2, Truck, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/woocommerce';
import { ShippingMethod } from '@/lib/shipping-service';
import { useEffect } from 'react';

export type { ShippingMethod };

interface ShippingMethodSelectorProps {
  postcode?: string;
  cartTotal?: number;
  selectedMethod?: string;
  onMethodChange?: (method: ShippingMethod) => void;
  onShippingCostChange?: (cost: number) => void;
  className?: string;
}

export function ShippingMethodSelector({
  postcode,
  cartTotal,
  selectedMethod,
  onMethodChange,
  onShippingCostChange,
  className
}: ShippingMethodSelectorProps) {
  const {
    shippingAddress,
    availableShippingMethods,
    selectedShippingMethod,
    restrictedProducts,
    isCalculatingShipping,
    freeShippingThreshold,
    amountToFreeShipping,
    selectShippingMethod,
    getSubtotal,
  } = useCartStore();

  // Use props if provided, otherwise fall back to cart store
  const effectivePostcode = postcode || shippingAddress?.postcode;
  const subtotal = cartTotal !== undefined ? cartTotal : getSubtotal();
  const freeShippingProgress = Math.min((subtotal / freeShippingThreshold) * 100, 100);
  const qualifiesForFreeShipping = subtotal >= freeShippingThreshold;

  // FIX: Auto-notify parent when cart store selects free shipping AND customer qualifies
  useEffect(() => {
    if (selectedShippingMethod && onMethodChange && !selectedMethod) {
      // Only auto-select free shipping if customer qualifies (cart >= 500 SEK)
      if (selectedShippingMethod.method_id === 'free_shipping') {
        if (qualifiesForFreeShipping) {
          console.log('✅ Auto-selecting free shipping (qualifies):', subtotal, '>=', freeShippingThreshold);
          onMethodChange(selectedShippingMethod);
          if (onShippingCostChange) {
            onShippingCostChange(selectedShippingMethod.cost);
          }
        } else {
          console.log('⚠️ Not auto-selecting free shipping (does not qualify):', subtotal, '<', freeShippingThreshold);
          // Don't auto-select - let user choose another method
        }
      } else {
        // For non-free shipping methods (like store pickup), auto-select them
        console.log('✅ Auto-selecting shipping method:', selectedShippingMethod.label);
        onMethodChange(selectedShippingMethod);
        if (onShippingCostChange) {
          onShippingCostChange(selectedShippingMethod.cost);
        }
      }
    }
  }, [selectedShippingMethod, onMethodChange, onShippingCostChange, selectedMethod, qualifiesForFreeShipping, subtotal, freeShippingThreshold]);

  const getMethodIcon = (methodId: string) => {
    switch (methodId) {
      case 'local_pickup':
        return <Package className="h-5 w-5" />;
      case 'free_shipping':
        return <Gift className="h-5 w-5 text-green-600" />;
      default:
        return <Truck className="h-5 w-5" />;
    }
  };

  // 1. No address entered
  if (!effectivePostcode && !shippingAddress) {
    return (
      <Alert className={className}>
        <AlertDescription>
          Please enter your shipping address first to see available shipping methods.
        </AlertDescription>
      </Alert>
    );
  }

  // 2. Calculating shipping
  if (isCalculatingShipping) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
          <span className="text-neutral-600">
            Calculating shipping rates with DHL...
          </span>
        </div>
      </Card>
    );
  }

  // 3. Restricted products
  if (restrictedProducts.length > 0) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <p className="font-semibold">
            Some products cannot be shipped to your address:
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            {restrictedProducts.map((product) => (
              <li key={product.product_id}>
                <strong>{product.product_name}</strong>: {product.reason}
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    );
  }

  // 4. No methods available
  if (availableShippingMethods.length === 0) {
    return (
      <Alert className={className}>
        <AlertDescription>
          No shipping methods available for your address. Please verify your postal code
          and try again.
        </AlertDescription>
      </Alert>
    );
  }

  // 5. Show methods with free shipping progress
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h2 className="font-heading text-2xl font-bold text-primary-950 dark:text-primary-50">
          Shipping Method
        </h2>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Shipping to {effectivePostcode || shippingAddress?.postcode}
          {shippingAddress?.city && `, ${shippingAddress.city}`}
        </p>
      </div>

      {/* Free Shipping Progress Bar */}
      {subtotal < freeShippingThreshold && (
        <Card className="border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 font-medium text-green-800 dark:text-green-300">
                <Gift className="h-4 w-4" />
                Free shipping at {formatPrice(freeShippingThreshold, 'SEK')}
              </span>
              <span className="font-semibold text-green-700 dark:text-green-400">
                {formatPrice(amountToFreeShipping, 'SEK')} to go!
              </span>
            </div>
            <Progress value={freeShippingProgress} className="h-2" />
          </div>
        </Card>
      )}

      {/* Shipping achieved message */}
      {subtotal >= freeShippingThreshold && (
        <Card className="border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/20">
          <div className="flex items-center gap-2 text-green-800 dark:text-green-300">
            <Gift className="h-5 w-5" />
            <p className="font-semibold">
              Congratulations! You qualify for free shipping!
            </p>
          </div>
        </Card>
      )}

      {/* Shipping Methods */}
      <RadioGroup
        value={selectedMethod || selectedShippingMethod?.id}
        onValueChange={(id) => {
          const method = availableShippingMethods.find((m) => m.id === id);
          if (method) {
            // Use callback props if provided, otherwise use cart store
            if (onMethodChange) {
              onMethodChange(method);
              if (onShippingCostChange) {
                onShippingCostChange(method.cost);
              }
            } else {
              selectShippingMethod(method);
            }
          }
        }}
      >
        <div className="space-y-3">
          {availableShippingMethods.map((method) => (
            <Card
              key={method.id}
              className={cn(
                'cursor-pointer transition-all hover:border-primary-500',
                (selectedMethod || selectedShippingMethod?.id) === method.id
                  ? 'border-primary-500 bg-primary-50/50 ring-2 ring-primary-500 dark:bg-primary-950/20'
                  : 'border-neutral-200 dark:border-neutral-800'
              )}
              onClick={() => {
                if (onMethodChange) {
                  onMethodChange(method);
                  if (onShippingCostChange) {
                    onShippingCostChange(method.cost);
                  }
                } else {
                  selectShippingMethod(method);
                }
              }}
            >
              <div className="flex items-start gap-4 p-4">
                <RadioGroupItem
                  value={method.id}
                  id={method.id}
                  className="mt-1"
                />
                <div className="flex flex-1 items-start gap-3">
                  <div className="mt-0.5 text-primary-600 dark:text-primary-400">
                    {getMethodIcon(method.method_id)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <Label
                        htmlFor={method.id}
                        className="cursor-pointer font-semibold text-primary-950 dark:text-primary-50"
                      >
                        {method.label}
                      </Label>
                      <span className="font-bold text-primary-700 dark:text-primary-400">
                        {method.cost === 0 ? (
                          <span className="text-green-600 dark:text-green-400">
                            Free
                          </span>
                        ) : (
                          formatPrice(method.total_cost, 'SEK')
                        )}
                      </span>
                    </div>
                    {/* Show DHL info if available */}
                    {method.method_id.includes('dhl') && (
                      <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                        Powered by DHL eCommerce Sweden
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </RadioGroup>
    </div>
  );
}
