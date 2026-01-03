import { NextRequest, NextResponse } from 'next/server';

const WOOCOMMERCE_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://crm.ideallivs.com';
const CONSUMER_KEY = process.env.WORDPRESS_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.WORDPRESS_CONSUMER_SECRET || '';

/**
 * PATCH /api/orders/[orderId]/mark-paid
 * Mark an existing WooCommerce order as paid after successful Stripe payment.
 * This is used for the "Pay for Order" flow where the order already exists.
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;
        const body = await request.json();
        const { orderKey, paymentIntentId } = body;

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        if (!orderKey) {
            return NextResponse.json({ error: 'Order key is required for security' }, { status: 400 });
        }

        // First, fetch the order to verify the key
        const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

        const getResponse = await fetch(
            `${WOOCOMMERCE_URL}/wp-json/wc/v3/orders/${orderId}`,
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            }
        );

        if (!getResponse.ok) {
            if (getResponse.status === 404) {
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }
            throw new Error(`WooCommerce API error: ${getResponse.status}`);
        }

        const order = await getResponse.json();

        // Verify order key matches
        if (order.order_key !== orderKey) {
            return NextResponse.json({ error: 'Invalid order key' }, { status: 403 });
        }

        // Check if order is already paid
        if (order.status === 'completed' || order.status === 'processing') {
            return NextResponse.json({
                message: 'Order is already marked as paid',
                order_id: order.id,
                status: order.status,
            });
        }

        // Update order status to 'processing' and mark as paid
        const updateResponse = await fetch(
            `${WOOCOMMERCE_URL}/wp-json/wc/v3/orders/${orderId}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'processing',
                    set_paid: true,
                    transaction_id: paymentIntentId || '',
                    payment_method: 'stripe',
                    payment_method_title: 'Credit/Debit Card (Stripe)',
                    meta_data: [
                        {
                            key: '_stripe_payment_intent',
                            value: paymentIntentId || '',
                        },
                        {
                            key: '_paid_via_frontend',
                            value: 'true',
                        },
                        {
                            key: '_paid_date',
                            value: new Date().toISOString(),
                        },
                    ],
                }),
            }
        );

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(errorData.message || `Failed to update order: ${updateResponse.status}`);
        }

        const updatedOrder = await updateResponse.json();

        console.log(`Order ${orderId} marked as paid with PaymentIntent: ${paymentIntentId}`);

        return NextResponse.json({
            success: true,
            message: 'Order marked as paid successfully',
            order_id: updatedOrder.id,
            status: updatedOrder.status,
        });

    } catch (error) {
        console.error('Error marking order as paid:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to mark order as paid' },
            { status: 500 }
        );
    }
}
