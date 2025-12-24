'use client';

import { ExpressCheckoutElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { loadStripe, StripeExpressCheckoutElementClickEvent, StripeExpressCheckoutElementConfirmEvent } from '@stripe/stripe-js';
import { useState, useMemo, useEffect } from 'react';
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
    showDebug?: boolean;
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
    showDebug = false,
}: ExpressCheckoutProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');
    const [availableMethods, setAvailableMethods] = useState<any>(null);

    useEffect(() => {
        console.log('🔧 Stripe loaded:', !!stripe);
        console.log('🔧 Elements loaded:', !!elements);
    }, [stripe, elements]);

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
        console.log('📱 Express Checkout ready, available methods:', availablePaymentMethods);
        setAvailableMethods(availablePaymentMethods);

        if (availablePaymentMethods && Object.keys(availablePaymentMethods).length > 0) {
            // Check if at least one method is available
            const hasMethod = Object.values(availablePaymentMethods).some(v => v === true);
            setStatus(hasMethod ? 'ready' : 'unavailable');
        } else {
            setStatus('unavailable');
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
            applePay: 'always',  // Always try to show
            googlePay: 'always', // Always try to show
            link: 'auto',        // Show if configured
        },
        layout: {
            maxRows: 2,
            maxColumns: 4,
            overflow: 'never',
        },
    };

    // If no methods available and not in debug mode, hide completely
    if (status === 'unavailable' && !showDebug) {
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

            {/* Express Checkout Element - Always render it, Stripe handles visibility */}
            <div className={status === 'loading' ? 'min-h-[48px]' : ''}>
                <ExpressCheckoutElement
                    options={expressCheckoutOptions}
                    onClick={handleClick}
                    onConfirm={handleConfirm}
                    onReady={handleReady}
                />
            </div>

            {/* Debug info - shown only when enabled */}
            {showDebug && (
                <div className="mt-4 rounded bg-yellow-50 p-3 text-xs dark:bg-yellow-900/20">
                    <p className="font-bold text-yellow-800 dark:text-yellow-300">Debug Info:</p>
                    <p>Status: {status}</p>
                    <p>Stripe loaded: {stripe ? 'Yes' : 'No'}</p>
                    <p>Elements loaded: {elements ? 'Yes' : 'No'}</p>
                    <p>Amount: {amount} SEK</p>
                    <p>Available methods: {JSON.stringify(availableMethods)}</p>
                </div>
            )}

            {/* Status messages */}
            {status === 'loading' && (
                <p className="mt-2 text-center text-xs text-neutral-500">
                    Loading payment options...
                </p>
            )}

            {status === 'unavailable' && showDebug && (
                <p className="mt-2 text-center text-xs text-red-500">
                    No express payment methods available. Check Stripe Dashboard settings.
                </p>
            )}

            {status === 'ready' && (
                <>
                    {/* Info text */}
                    <p className="mt-4 text-center text-xs text-neutral-500 dark:text-neutral-400">
                        Pay instantly with Apple Pay, Google Pay, or Link
                    </p>

                    {/* Separator */}
                    <div className="mt-6 flex items-center gap-3">
                        <div className="h-px flex-1 bg-neutral-300 dark:bg-neutral-700" />
                        <span className="text-sm font-medium text-neutral-500">Or continue below</span>
                        <div className="h-px flex-1 bg-neutral-300 dark:bg-neutral-700" />
                    </div>
                </>
            )}
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
    }), [amount, currency]);

    if (amount <= 0) {
        console.log('⚠️ Express Checkout: Amount is 0 or less, not rendering');
        return null;
    }

    console.log('🚀 Rendering Express Checkout with amount:', amount, currency);

    return (
        <Elements stripe={stripePromise} options={elementsOptions}>
            <ExpressCheckoutInner {...props} />
        </Elements>
    );
}

export default StripeExpressCheckout;
