'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createOrderAction } from '@/app/actions/order';
import { useCartStore } from '@/store/cart-store';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

// Helper to get payment method title
function getPaymentMethodTitle(method: string): string {
    const titles: Record<string, string> = {
        stripe: 'Credit/Debit Card (Stripe)',
        stripe_cc: 'Credit/Debit Card',
        klarna: 'Klarna',
        cod: 'Cash on Delivery',
    };
    return titles[method] || 'Online Payment';
}

interface CheckoutData {
    billing: any;
    shipping: any;
    shippingMethod: {
        method_id: string;
        label: string;
        cost: number;
    };
    paymentMethod: string;
    items: Array<{
        product_id: number;
        variation_id?: number;
        quantity: number;
        tax_class?: string;  // Tax class for Swedish tax rates: '' (standard 25%), 'reduced-rate' (12% for food)
    }>;
    orderNotes?: string;
    coupon?: { code: string } | null;
    paymentIntentId: string;
}

function StripeReturnContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { clearCart } = useCartStore();
    const [status, setStatus] = useState<'loading' | 'creating-order' | 'success' | 'failed' | 'processing'>('loading');
    const [message, setMessage] = useState('');
    const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<number | null>(null);

    useEffect(() => {
        const handleReturn = async () => {
            const clientSecret = searchParams.get('payment_intent_client_secret');
            const redirectStatus = searchParams.get('redirect_status');

            if (!clientSecret) {
                setStatus('failed');
                setMessage('No payment information found. Please try again.');
                return;
            }

            try {
                const stripe = await stripePromise;
                if (!stripe) {
                    setStatus('failed');
                    setMessage('Failed to load payment processor.');
                    return;
                }

                // Retrieve the PaymentIntent status
                const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret);

                if (error) {
                    setStatus('failed');
                    setMessage(error.message || 'Failed to verify payment status.');
                    return;
                }

                if (!paymentIntent) {
                    setStatus('failed');
                    setMessage('Payment information not found.');
                    return;
                }

                setPaymentIntentId(paymentIntent.id);

                // Handle payment status
                switch (paymentIntent.status) {
                    case 'succeeded':
                    case 'processing':
                        // Payment successful - now create the WooCommerce order
                        setStatus('creating-order');
                        setMessage('Payment verified! Creating your order...');

                        // Retrieve checkout data from sessionStorage
                        const storedData = sessionStorage.getItem('pendingCheckoutData');
                        if (!storedData) {
                            setStatus('failed');
                            setMessage('Checkout data not found. Your payment was successful but we could not create the order. Please contact support with payment ID: ' + paymentIntent.id);
                            return;
                        }

                        const checkoutData: CheckoutData = JSON.parse(storedData);

                        // Verify the payment intent matches
                        if (checkoutData.paymentIntentId !== paymentIntent.id) {
                            console.warn('PaymentIntent mismatch, but proceeding with order creation');
                        }

                        // Create WooCommerce order
                        try {
                            const result = await createOrderAction({
                                billing: checkoutData.billing,
                                shipping: checkoutData.shipping,
                                line_items: checkoutData.items,
                                shipping_lines: [
                                    {
                                        method_id: checkoutData.shippingMethod.method_id,
                                        method_title: checkoutData.shippingMethod.label,
                                        total: checkoutData.shippingMethod.cost.toString(),
                                    },
                                ],
                                payment_method: checkoutData.paymentMethod,
                                payment_method_title: getPaymentMethodTitle(checkoutData.paymentMethod),
                                customer_note: checkoutData.orderNotes || undefined,
                                coupon_lines: checkoutData.coupon ? [{ code: checkoutData.coupon.code }] : undefined,
                                set_paid: paymentIntent.status === 'succeeded',
                                transaction_id: paymentIntent.id,
                            });

                            if (!result.success || !result.data) {
                                throw new Error(result.error || 'Failed to create order');
                            }

                            // Clear sessionStorage and cart
                            sessionStorage.removeItem('pendingCheckoutData');
                            clearCart();

                            setOrderId(result.data.id);
                            setStatus('success');
                            setMessage('Payment successful! Your order has been placed.');

                            // Redirect to success page after a short delay
                            setTimeout(() => {
                                router.push(`/checkout/success?order=${result.data.id}&payment_intent=${paymentIntent.id}`);
                            }, 2000);

                        } catch (orderError) {
                            console.error('Order creation failed:', orderError);
                            setStatus('failed');
                            setMessage(
                                `Payment was successful but order creation failed. Please contact support with payment ID: ${paymentIntent.id}. Error: ${orderError instanceof Error ? orderError.message : 'Unknown error'}`
                            );
                        }
                        break;

                    case 'requires_payment_method':
                        setStatus('failed');
                        setMessage('Payment failed. Please try again with a different payment method.');
                        break;

                    case 'requires_action':
                        setStatus('failed');
                        setMessage('Additional authentication required. Please complete the verification.');
                        break;

                    default:
                        setStatus('failed');
                        setMessage(`Unexpected payment status: ${paymentIntent.status}`);
                }
            } catch (err) {
                console.error('Error verifying payment:', err);
                setStatus('failed');
                setMessage('An error occurred while verifying your payment.');
            }
        };

        handleReturn();
    }, [searchParams, router, clearCart]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-8 text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                        <h1 className="text-xl font-semibold mb-2">Verifying Payment</h1>
                        <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
                    </>
                )}

                {status === 'creating-order' && (
                    <>
                        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                        <h1 className="text-xl font-semibold mb-2">Creating Your Order</h1>
                        <p className="text-muted-foreground">{message}</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-xl font-semibold mb-2 text-green-700">Order Placed Successfully!</h1>
                        <p className="text-muted-foreground mb-4">{message}</p>
                        {orderId && (
                            <p className="text-sm font-medium mb-2">Order #{orderId}</p>
                        )}
                        <p className="text-sm text-muted-foreground">Redirecting to order confirmation...</p>
                    </>
                )}

                {status === 'processing' && (
                    <>
                        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                        <h1 className="text-xl font-semibold mb-2 text-yellow-700">Payment Processing</h1>
                        <p className="text-muted-foreground mb-4">{message}</p>
                        <Link href="/my-account/orders">
                            <Button>View My Orders</Button>
                        </Link>
                    </>
                )}

                {status === 'failed' && (
                    <>
                        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h1 className="text-xl font-semibold mb-2 text-red-700">Something Went Wrong</h1>
                        <p className="text-muted-foreground mb-4 text-sm">{message}</p>
                        <div className="space-y-2">
                            <Link href="/checkout" className="block">
                                <Button className="w-full">Try Again</Button>
                            </Link>
                            <Link href="/cart" className="block">
                                <Button variant="outline" className="w-full">Return to Cart</Button>
                            </Link>
                        </div>
                        {paymentIntentId && (
                            <p className="text-xs text-muted-foreground mt-4">
                                Reference: {paymentIntentId}
                            </p>
                        )}
                    </>
                )}
            </Card>
        </div>
    );
}

export default function StripeReturnPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center">
                    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                    <h1 className="text-xl font-semibold mb-2">Loading...</h1>
                </Card>
            </div>
        }>
            <StripeReturnContent />
        </Suspense>
    );
}
