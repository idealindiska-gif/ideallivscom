import { Suspense } from 'react';
import Link from 'next/link';
import { Container, Section } from '@/components/craft';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getOrder } from '@/lib/woocommerce/orders';
import { formatPrice } from '@/lib/woocommerce';
import { CheckCircle2, Package, Mail, ArrowRight } from 'lucide-react';
import { OrderSuccessTracking } from '@/components/checkout/order-success-tracking';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Order Confirmed - Anmol Sweets',
    description: 'Your order has been successfully placed',
};

interface SuccessPageProps {
    searchParams: Promise<{ order?: string }>;
}

async function OrderDetails({ orderId }: { orderId: string }) {
    try {
        const order = await getOrder(parseInt(orderId));

        return (
            <div className="space-y-6">
                {/* Analytics Tracking and Google Customer Reviews */}
                <OrderSuccessTracking
                    orderId={order.id.toString()}
                    orderNumber={order.number}
                    total={order.total}
                    shippingTotal={order.shipping_total}
                    lineItems={order.line_items}
                    customerEmail={order.billing.email}
                    deliveryCountry={order.shipping.country || 'SE'}
                />

                <Card className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                        <div>
                            <h2 className="font-heading text-xl font-bold text-primary-950 dark:text-primary-50">
                                Order #{order.number}
                            </h2>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Placed on {new Date(order.date_created).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                        <div className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-950 dark:text-green-400">
                            {order.status}
                        </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Order Items */}
                    <div className="space-y-3">
                        <h3 className="font-semibold">Order Items</h3>
                        {order.line_items.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span className="text-neutral-600 dark:text-neutral-400">
                                    {item.name} × {item.quantity}
                                </span>
                                <span className="font-medium">{formatPrice(parseFloat(item.total), 'SEK')}</span>
                            </div>
                        ))}
                    </div>

                    <Separator className="my-4" />

                    {/* Totals */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400">Subtotal</span>
                            <span>{formatPrice(parseFloat(order.total) - parseFloat(order.shipping_total), 'SEK')}</span>
                        </div>
                        {parseFloat(order.shipping_total) > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-600 dark:text-neutral-400">Shipping</span>
                                <span>{formatPrice(parseFloat(order.shipping_total), 'SEK')}</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                            <span>Total</span>
                            <span className="text-primary-700 dark:text-primary-400">
                                {formatPrice(parseFloat(order.total), 'SEK')}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Shipping & Billing */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="p-6">
                        <h3 className="mb-3 font-semibold">Shipping Address</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {order.shipping.first_name} {order.shipping.last_name}
                            <br />
                            {order.shipping.address_1}
                            {order.shipping.address_2 && (
                                <>
                                    <br />
                                    {order.shipping.address_2}
                                </>
                            )}
                            <br />
                            {order.shipping.city}, {order.shipping.state} {order.shipping.postcode}
                            <br />
                            {order.shipping.country}
                        </p>
                    </Card>

                    <Card className="p-6">
                        <h3 className="mb-3 font-semibold">Billing Address</h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            {order.billing.first_name} {order.billing.last_name}
                            <br />
                            {order.billing.address_1}
                            {order.billing.address_2 && (
                                <>
                                    <br />
                                    {order.billing.address_2}
                                </>
                            )}
                            <br />
                            {order.billing.city}, {order.billing.state} {order.billing.postcode}
                            <br />
                            {order.billing.country}
                            <br />
                            <br />
                            Email: {order.billing.email}
                            <br />
                            Phone: {order.billing.phone}
                        </p>
                    </Card>
                </div>

                {/* Payment Method */}
                <Card className="p-6">
                    <h3 className="mb-3 font-semibold">Payment Method</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {order.payment_method_title}
                    </p>
                </Card>
            </div>
        );
    } catch (error) {
        return (
            <Card className="p-8 text-center">
                <p className="text-neutral-600 dark:text-neutral-400">
                    Unable to load order details. Please check your email for confirmation.
                </p>
            </Card>
        );
    }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
    const params = await searchParams;
    const orderId = params.order;

    return (
        <Section>
            <Container>
                <div className="mx-auto max-w-3xl">
                    {/* Success Header */}
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h1 className="mb-2 font-heading text-4xl font-bold text-primary-950 dark:text-primary-50">
                            Order Confirmed!
                        </h1>
                        <p className="text-lg text-neutral-600 dark:text-neutral-400">
                            Thank you for your order. We&apos;ve sent a confirmation email with your order details.
                        </p>
                    </div>

                    {/* What's Next */}
                    <Card className="mb-8 p-6">
                        <h2 className="mb-4 font-heading text-xl font-bold text-primary-950 dark:text-primary-50">
                            What happens next?
                        </h2>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950">
                                    <Mail className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Order Confirmation</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        You&apos;ll receive an email confirmation with your order details shortly.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-950">
                                    <Package className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Order Processing</h3>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                        We&apos;re preparing your order for delivery. You&apos;ll be notified when it ships.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Order Details */}
                    {orderId && (
                        <Suspense
                            fallback={
                                <Card className="p-8 text-center">
                                    <p className="text-neutral-600 dark:text-neutral-400">Loading order details...</p>
                                </Card>
                            }
                        >
                            <OrderDetails orderId={orderId} />
                        </Suspense>
                    )}

                    {/* Actions */}
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                        <Button asChild size="lg" className="rounded-full">
                            <Link href="/shop">
                                Continue Shopping
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-full">
                            <Link href="/">Return to Home</Link>
                        </Button>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
