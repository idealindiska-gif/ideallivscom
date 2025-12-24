'use client';

import { useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState, useRef } from 'react';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface ExpressCheckoutButtonProps {
    amount: number;
    currency?: string;
    label?: string;
    onSuccess: (paymentMethod: any, shippingAddress?: any) => void;
    onError?: (error: string) => void;
    onShippingAddress?: (address: any) => void;
}

/**
 * Express Checkout Element for Apple Pay and Google Pay
 * This matches the WordPress Stripe Gateway plugin implementation
 * 
 * Key difference from PaymentRequestButton:
 * - Shows BEFORE any forms are filled
 * - Uses Elements API with PaymentRequest
 * - Handles shipping address collection via wallet UI
 */
function ExpressCheckoutButtonInner({
    amount,
    currency = 'SEK',
    label = 'Total',
    onSuccess,
    onError,
    onShippingAddress,
}: ExpressCheckoutButtonProps) {
    const stripe = useStripe();
    const [paymentRequest, setPaymentRequest] = useState<any>(null);
    const [canMakePayment, setCanMakePayment] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!stripe) return;

        // Create Payment Request - matches WordPress plugin
        const pr = stripe.paymentRequest({
            country: 'SE',
            currency: currency.toLowerCase(),
            total: {
                label: label,
                amount: Math.round(amount * 100), // Amount in öre
            },
            requestPayerName: true,
            requestPayerEmail: true,
            requestPayerPhone: true,
            requestShipping: true, // Request shipping info via wallet
            shippingOptions: [
                {
                    id: 'free_shipping',
                    label: 'Free Shipping (500+ SEK)',
                    detail: 'Arrives in 2-4 business days',
                    amount: 0,
                },
                {
                    id: 'store_delivery',
                    label: 'Store Delivery',
                    detail: 'Local delivery in Stockholm',
                    amount: 3750, // 37.50 SEK in öre
                },
            ],
        });

        // Check if wallet is available
        pr.canMakePayment().then((result) => {
            if (result) {
                setPaymentRequest(pr);
                setCanMakePayment(true);
                console.log('✅ Express Checkout available:', result);
                // result.applePay = true if Apple Pay available
                // result.googlePay = true if Google Pay available
            } else {
                console.log('ℹ️ Express Checkout not available - wallet not set up or wrong browser');
            }
        });

        // Handle shipping address change
        pr.on('shippingaddresschange', async (event) => {
            console.log('📍 Shipping address changed:', event.shippingAddress);

            // Notify parent of shipping address
            if (onShippingAddress) {
                onShippingAddress(event.shippingAddress);
            }

            // Update shipping options based on address
            const isStockholm = event.shippingAddress.postalCode?.startsWith('1');

            event.updateWith({
                status: 'success',
                shippingOptions: isStockholm ? [
                    {
                        id: 'free_shipping',
                        label: 'Free Shipping',
                        detail: 'Orders over 500 SEK',
                        amount: 0,
                    },
                    {
                        id: 'store_delivery',
                        label: 'Store Delivery',
                        detail: 'Local delivery in Stockholm',
                        amount: 3750,
                    },
                ] : [
                    {
                        id: 'dhl_home',
                        label: 'DHL Home Delivery',
                        detail: '2-4 business days',
                        amount: 24279,
                    },
                ],
            });
        });

        // Handle payment method
        pr.on('paymentmethod', async (event) => {
            console.log('💳 Payment method received:', event.paymentMethod);

            try {
                // Call parent with payment method and shipping info
                onSuccess(event.paymentMethod, event.shippingAddress);
                event.complete('success');
            } catch (error) {
                console.error('Payment failed:', error);
                event.complete('fail');
                onError?.(error instanceof Error ? error.message : 'Payment failed');
            }
        });

        return () => {
            pr.off('shippingaddresschange');
            pr.off('paymentmethod');
        };
    }, [stripe, amount, currency, label, onSuccess, onError, onShippingAddress]);

    // Mount the button
    useEffect(() => {
        if (!stripe || !paymentRequest || !buttonRef.current) return;

        const elements = stripe.elements();
        const prButton = elements.create('paymentRequestButton', {
            paymentRequest,
            style: {
                paymentRequestButton: {
                    type: 'default',
                    theme: 'dark',
                    height: '48px',
                },
            },
        });

        prButton.mount(buttonRef.current);

        return () => {
            prButton.unmount();
        };
    }, [stripe, paymentRequest]);

    if (!canMakePayment) {
        // Don't show anything if wallets aren't available
        return null;
    }

    return (
        <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
            {/* Express Checkout Header */}
            <div className="mb-4 flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Express Checkout
                </span>
                <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Fast & Secure
                </span>
            </div>

            {/* Payment Request Button */}
            <div ref={buttonRef} id="express-checkout-button" className="mb-4" />

            {/* Info text */}
            <p className="text-center text-xs text-neutral-500 dark:text-neutral-400">
                Skip the form and pay directly with Apple Pay or Google Pay
            </p>

            {/* Separator */}
            <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-neutral-300 dark:bg-neutral-700" />
                <span className="text-sm font-medium text-neutral-500">
                    Or fill out the form below
                </span>
                <div className="h-px flex-1 bg-neutral-300 dark:bg-neutral-700" />
            </div>
        </div>
    );
}

/**
 * Wrapper component that provides Stripe Elements context
 * This can be used WITHOUT a clientSecret (unlike PaymentElement)
 */
export function ExpressCheckoutButton(props: ExpressCheckoutButtonProps) {
    return (
        <Elements stripe={stripePromise}>
            <ExpressCheckoutButtonInner {...props} />
        </Elements>
    );
}
