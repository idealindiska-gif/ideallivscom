'use client';

import { useStripe } from '@stripe/react-stripe-js';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { AppleIcon, Smartphone } from 'lucide-react';

interface ExpressCheckoutButtonProps {
    amount: number;
    currency?: string;
    onPaymentSuccess: (paymentIntentId: string) => void;
    onError?: (error: string) => void;
}

/**
 * Express Checkout buttons for Apple Pay and Google Pay
 * This component uses Stripe's Payment Request Button API
 * which is the SAME approach used by WooCommerce Stripe Gateway
 */
export function ExpressCheckoutButtons({
    amount,
    currency = 'sek',
    onPaymentSuccess,
    onError,
}: ExpressCheckoutButtonProps) {
    const stripe = useStripe();
    const [paymentRequest, setPaymentRequest] = useState<any>(null);
    const [canMakePayment, setCanMakePayment] = useState(false);
    const buttonContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!stripe) return;

        // Create Payment Request - this is what WordPress uses
        const pr = stripe.paymentRequest({
            country: 'SE',
            currency: currency.toLowerCase(),
            total: {
                label: 'Total',
                amount: Math.round(amount), // Amount in öre (cents)
            },
            requestPayerName: true,
            requestPayerEmail: true,
            requestShipping: false, // We already have shipping from checkout form
        });

        // Check if Apple Pay or Google Pay is available
        pr.canMakePayment().then((result) => {
            if (result) {
                setPaymentRequest(pr);
                setCanMakePayment(true);
                console.log('✅ Express checkout available:', result);
            } else {
                console.log('❌ Express checkout not available');
            }
        });

        pr.on('paymentmethod', async (ev) => {
            try {
                // Payment method created successfully
                // In a real implementation, you would:
                // 1. Confirm the payment on your server
                // 2. Create the order
                // 3. Complete the payment

                // For now, we'll just complete it
                ev.complete('success');

                if (ev.paymentIntent?.id) {
                    onPaymentSuccess(ev.paymentIntent.id);
                }
            } catch (error) {
                console.error('Payment failed:', error);
                ev.complete('fail');
                onError?.(error instanceof Error ? error.message : 'Payment failed');
            }
        });

        return () => {
            pr.abort();
        };
    }, [stripe, amount, currency, onPaymentSuccess, onError]);

    useEffect(() => {
        if (!stripe || !paymentRequest || !buttonContainerRef.current) return;

        // Mount the Payment Request Button
        const elements = stripe.elements();
        const prButton = elements.create('paymentRequestButton', {
            paymentRequest,
        });

        prButton.mount(buttonContainerRef.current);

        return () => {
            prButton.unmount();
        };
    }, [stripe, paymentRequest]);

    if (!canMakePayment) {
        return null; // Don't show anything if express checkout is not available
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                <span className="text-sm text-neutral-500">Express Checkout</span>
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            </div>

            {/* Stripe Payment Request Button (Apple Pay / Google Pay) */}
            <div ref={buttonContainerRef} className="w-full" />

            <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
                <span className="text-sm text-neutral-500">Or pay with</span>
                <div className="h-px flex-1 bg-neutral-200 dark:bg-neutral-800" />
            </div>
        </div>
    );
}
