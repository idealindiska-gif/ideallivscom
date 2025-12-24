'use client';

import { ExpressCheckoutElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeExpressCheckoutElementClickEvent, StripeExpressCheckoutElementConfirmEvent } from '@stripe/stripe-js';
import { useState, useMemo } from 'react';
import type {
    StripeExpressCheckoutElementOptions,
    StripeElementsOptionsMode,
} from '@stripe/stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface ExpressCheckoutProps {
    amount: number;
    currency?: string;
    onSuccess: (paymentIntent: any) => void;
    onError?: (error: string) => void;
    shippingAddress?: {
        name: string;
        address_1: string;
        address_2?: string;
        city: string;
        state?: string;
        postcode: string;
        country: string;
    };
    billingAddress?: {
        name: string;
        address_1: string;
        address_2?: string;
        city: string;
        state?: string;
        postcode: string;
        country: string;
    };
}

/**
 * Express Checkout Element Component
 * Uses the NEW Stripe ExpressCheckoutElement (same as WordPress Stripe Gateway)
 * This shows Apple Pay, Google Pay, Link, etc. as buttons
 */
function ExpressCheckoutInner({
    amount,
    onSuccess,
    onError,
    shippingAddress,
    billingAddress,
}: ExpressCheckoutProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isReady, setIsReady] = useState(false);

    // Handle click - called when user clicks the button
    const handleClick = (event: StripeExpressCheckoutElementClickEvent) => {
        console.log('🔘 Express Checkout clicked:', event.expressPaymentType);
        // Resolve to show the payment sheet
        event.resolve();
    };

    // Handle confirm - called after user authenticates
    const handleConfirm = async (event: StripeExpressCheckoutElementConfirmEvent) => {
        if (!stripe || !elements) {
            onError?.('Stripe not loaded');
            return;
        }

        console.log('✅ Express Checkout confirming:', event.expressPaymentType);
        console.log('Billing details:', event.billingDetails);
        console.log('Shipping address:', event.shippingAddress);

        try {
            // Submit the payment
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/checkout/stripe-return`,
                },
            });

            if (error) {
                console.error('Payment error:', error);
                onError?.(error.message || 'Payment failed');
            } else {
                // Payment succeeded or will redirect
                console.log('Payment submitted successfully');
                onSuccess({ success: true });
            }
        } catch (err) {
            console.error('Payment exception:', err);
            onError?.(err instanceof Error ? err.message : 'Payment failed');
        }
    };

    // Handle ready - called when buttons are mounted
    const handleReady = ({ availablePaymentMethods }: { availablePaymentMethods?: any }) => {
        console.log('Express Checkout ready, available methods:', availablePaymentMethods);
        if (availablePaymentMethods) {
            setIsReady(true);
        }
    };

    // Options for the Express Checkout Element
    const expressCheckoutOptions: StripeExpressCheckoutElementOptions = {
        buttonHeight: 48,
        buttonTheme: {
            applePay: 'black',
            googlePay: 'black',
        },
        buttonType: {
            applePay: 'plain',
            googlePay: 'plain',
        },
        paymentMethods: {
            applePay: 'always',  // Always show if device supports it
            googlePay: 'always', // Always show if browser supports it
            link: 'auto',        // Show if configured
            amazonPay: 'never',  // Not configured
        },
        layout: {
            maxRows: 2,
            maxColumns: 4,
            overflow: 'never',
        },
    };

    if (!isReady) {
        // Show placeholder until ready
        return null;
    }

    return (
        <div className="mb-6 rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
            {/* Header */}
            <div className="mb-4 flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                    Express Checkout
                </span>
                <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Fast & Secure
                </span>
            </div>

            {/* Express Checkout Element */}
            <ExpressCheckoutElement
                options={expressCheckoutOptions}
                onClick={handleClick}
                onConfirm={handleConfirm}
                onReady={handleReady}
            />

            {/* Info text */}
            <p className="mt-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
                Pay instantly with Apple Pay, Google Pay, or Link
            </p>

            {/* Separator */}
            <div className="mt-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-neutral-300 dark:bg-neutral-700" />
                <span className="text-sm font-medium text-neutral-500">Or fill out the form below</span>
                <div className="h-px flex-1 bg-neutral-300 dark:bg-neutral-700" />
            </div>
        </div>
    );
}

/**
 * Wrapper component that provides Stripe Elements context
 * ExpressCheckoutElement requires an Elements provider with mode='payment'
 */
export function StripeExpressCheckout(props: ExpressCheckoutProps) {
    const { amount, currency = 'SEK' } = props;

    // Options for Elements - required for ExpressCheckout
    // This uses "deferred" mode where we'll create the PaymentIntent on confirm
    const elementsOptions: StripeElementsOptionsMode = useMemo(() => ({
        mode: 'payment',
        amount: Math.round(amount * 100), // Amount in smallest currency unit
        currency: currency.toLowerCase(),
        appearance: {
            theme: 'stripe',
            variables: {
                borderRadius: '8px',
            },
        },
        // Tell Stripe which payment methods we want
        paymentMethodTypes: ['card', 'link'],
    }), [amount, currency]);

    if (amount <= 0) {
        return null;
    }

    return (
        <Elements stripe={stripePromise} options={elementsOptions}>
            <ExpressCheckoutInner {...props} />
        </Elements>
    );
}

export default StripeExpressCheckout;
