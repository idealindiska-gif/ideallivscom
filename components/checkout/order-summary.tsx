'use client';

import Image from 'next/image';
import { formatPrice } from '@/lib/woocommerce';
import { useCartStore } from '@/store/cart-store';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag } from 'lucide-react';

interface OrderSummaryProps {
    shippingCost?: number;
    className?: string;
    discountAmount?: number;
    onApplyCoupon?: (coupon: any) => void;
    appliedCoupon?: string;
}

import { CouponInput } from './coupon-input';

// Swedish tax rates
const TAX_RATES = {
    standard: 25,     // Standard VAT rate (25%)
    'reduced-rate': 12, // Reduced rate for food items (12%)
    'zero-rate': 0,   // Zero-rated items
};

// Get tax rate based on product's tax_class
function getTaxRate(taxClass: string | undefined): number {
    if (!taxClass || taxClass === '' || taxClass === 'standard') {
        return TAX_RATES.standard; // 25%
    }
    if (taxClass === 'reduced-rate') {
        return TAX_RATES['reduced-rate']; // 12%
    }
    if (taxClass === 'zero-rate') {
        return TAX_RATES['zero-rate']; // 0%
    }
    // Default to standard rate
    return TAX_RATES.standard;
}

export function OrderSummary({
    shippingCost: propShippingCost,
    className,
    discountAmount = 0,
    onApplyCoupon,
    appliedCoupon
}: OrderSummaryProps) {
    const { items, getTotalPrice, getShippingCost } = useCartStore();

    // Get shipping cost from cart store (DHL rates) or fallback to prop
    const shippingCost = propShippingCost !== undefined ? propShippingCost : getShippingCost();

    // Calculate tax per item based on their tax_class
    // Swedish prices include tax, so we need to extract it
    let totalSubtotalWithoutTax = 0;
    let totalIncludedTax = 0;
    let taxBreakdown: { rate: number; amount: number }[] = [];

    // Track tax by rate for breakdown
    const taxByRate: Record<number, number> = {};
    const subtotalByRate: Record<number, number> = {};

    items.forEach((item) => {
        // Get tax class from variation first, fallback to product
        const taxClass = item.variation?.tax_class || item.product.tax_class;
        const taxRate = getTaxRate(taxClass);

        // Calculate item total (price * quantity)
        const itemTotal = item.price * item.quantity;

        // Extract tax from price (prices include tax in Sweden)
        // Formula: subtotal = total / (1 + taxRate/100)
        const taxMultiplier = 1 + (taxRate / 100);
        const itemSubtotalWithoutTax = itemTotal / taxMultiplier;
        const itemTax = itemTotal - itemSubtotalWithoutTax;

        totalSubtotalWithoutTax += itemSubtotalWithoutTax;
        totalIncludedTax += itemTax;

        // Track for breakdown display
        if (!taxByRate[taxRate]) {
            taxByRate[taxRate] = 0;
            subtotalByRate[taxRate] = 0;
        }
        taxByRate[taxRate] += itemTax;
        subtotalByRate[taxRate] += itemSubtotalWithoutTax;
    });

    // Create tax breakdown array for display
    taxBreakdown = Object.entries(taxByRate)
        .map(([rate, amount]) => ({
            rate: Number(rate),
            amount: amount as number
        }))
        .filter(item => item.amount > 0)
        .sort((a, b) => b.rate - a.rate); // Sort by rate descending (25%, then 12%)

    // Total items price (already includes tax)
    const totalWithTax = getTotalPrice();

    // Total = items total (already includes tax) + shipping - discount
    const total = Math.max(0, totalWithTax + shippingCost - discountAmount);

    // Check if we have mixed tax rates
    const hasMixedTaxRates = taxBreakdown.length > 1;

    if (items.length === 0) {
        return (
            <Card className={className}>
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <ShoppingBag className="mb-4 h-12 w-12 text-neutral-400" />
                    <p className="text-neutral-600 dark:text-neutral-400">Your cart is empty</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <div className="p-6">
                <h2 className="mb-6 font-heading text-xl font-bold text-primary-950 dark:text-primary-50">
                    Order Summary
                </h2>

                {/* Cart Items */}
                <div className="space-y-4">
                    {items.map((item) => {
                        const taxClass = item.variation?.tax_class || item.product.tax_class;
                        const taxRate = getTaxRate(taxClass);

                        return (
                            <div key={item.key} className="flex gap-4">
                                {/* Product Image */}
                                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border bg-neutral-100 dark:bg-neutral-800">
                                    {item.product.images && item.product.images.length > 0 ? (
                                        <Image
                                            src={item.product.images[0].src}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <ShoppingBag className="h-6 w-6 text-neutral-400" />
                                        </div>
                                    )}
                                    <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs">
                                        {item.quantity}
                                    </Badge>
                                </div>

                                {/* Product Info */}
                                <div className="flex flex-1 flex-col justify-between">
                                    <div>
                                        <p className="font-medium text-primary-950 dark:text-primary-50">
                                            {item.product.name}
                                        </p>
                                        {item.variation && (
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                                Variation: {item.variation.id}
                                            </p>
                                        )}
                                    </div>
                                    <p className="text-sm font-semibold text-primary-700 dark:text-primary-400">
                                        {formatPrice(item.price * item.quantity, 'SEK')}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <Separator className="my-6" />

                {/* Totals */}
                <div className="space-y-3">
                    {/* Subtotal without tax */}
                    <div className="flex justify-between text-sm">
                        <span className="text-neutral-600 dark:text-neutral-400">
                            Subtotal (excl. tax)
                        </span>
                        <span className="font-medium">{formatPrice(totalSubtotalWithoutTax, 'SEK')}</span>
                    </div>

                    {/* Tax breakdown - show each rate separately if mixed */}
                    {hasMixedTaxRates ? (
                        // Show breakdown for each tax rate
                        taxBreakdown.map(({ rate, amount }) => (
                            <div key={rate} className="flex justify-between text-sm">
                                <span className="text-neutral-600 dark:text-neutral-400">
                                    Tax ({rate}% {rate === 12 ? '- food items' : ''})
                                </span>
                                <span className="font-medium">{formatPrice(amount, 'SEK')}</span>
                            </div>
                        ))
                    ) : (
                        // Single tax rate - show simple display
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400">
                                Tax ({taxBreakdown[0]?.rate || 25}% included)
                            </span>
                            <span className="font-medium">{formatPrice(totalIncludedTax, 'SEK')}</span>
                        </div>
                    )}

                    {discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                            <span>Discount {appliedCoupon ? `(${appliedCoupon})` : ''}</span>
                            <span>-{formatPrice(discountAmount, 'SEK')}</span>
                        </div>
                    )}

                    {shippingCost > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400">Shipping</span>
                            <span className="font-medium">{formatPrice(shippingCost, 'SEK')}</span>
                        </div>
                    )}

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                        <span className="text-primary-950 dark:text-primary-50">Total</span>
                        <span className="text-primary-700 dark:text-primary-400">
                            {formatPrice(total, 'SEK')}
                        </span>
                    </div>
                </div>

                {onApplyCoupon && !appliedCoupon && (
                    <>
                        <Separator className="my-6" />
                        <CouponInput onApply={onApplyCoupon} />
                    </>
                )}

                {/* Additional Info */}
                <div className="mt-6 rounded-lg bg-neutral-50 p-4 text-sm dark:bg-neutral-900">
                    <p className="text-neutral-600 dark:text-neutral-400">
                        <strong>Note:</strong> Prices include VAT. Food items are charged at the reduced rate (12%), other items at the standard rate (25%).
                    </p>
                </div>
            </div>
        </Card>
    );
}
