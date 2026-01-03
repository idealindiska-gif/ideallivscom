import { NextRequest, NextResponse } from 'next/server';

const WOOCOMMERCE_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://crm.ideallivs.com';
const CONSUMER_KEY = process.env.WORDPRESS_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.WORDPRESS_CONSUMER_SECRET || '';

/**
 * GET /api/orders/[orderId]
 * Fetch order details from WooCommerce for the "pay for order" page.
 * Requires `key` query parameter to verify order ownership.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        const { orderId } = await params;
        const { searchParams } = new URL(request.url);
        const orderKey = searchParams.get('key');

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
        }

        if (!orderKey) {
            return NextResponse.json({ error: 'Order key is required' }, { status: 400 });
        }

        // Validate environment variables
        if (!CONSUMER_KEY || !CONSUMER_SECRET) {
            console.error('Missing WooCommerce API credentials');
            return NextResponse.json(
                { error: 'Server configuration error. Please contact support.' },
                { status: 500 }
            );
        }

        // Fetch order from WooCommerce
        const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

        const response = await fetch(
            `${WOOCOMMERCE_URL}/wp-json/wc/v3/orders/${orderId}`,
            {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Content-Type': 'application/json',
                },
                cache: 'no-store',
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }
            throw new Error(`WooCommerce API error: ${response.status}`);
        }

        const order = await response.json();

        // Verify order key matches (WooCommerce stores it as order_key)
        // The key format from URL is like "wc_order_xxx"
        if (order.order_key !== orderKey) {
            return NextResponse.json({ error: 'Invalid order key' }, { status: 403 });
        }

        // Return sanitized order data (don't expose everything)
        return NextResponse.json({
            id: order.id,
            status: order.status,
            total: order.total,
            currency: order.currency,
            date_created: order.date_created,
            billing: {
                first_name: order.billing.first_name,
                last_name: order.billing.last_name,
                email: order.billing.email,
                phone: order.billing.phone,
                address_1: order.billing.address_1,
                address_2: order.billing.address_2,
                city: order.billing.city,
                postcode: order.billing.postcode,
                country: order.billing.country,
                state: order.billing.state,
            },
            shipping: {
                first_name: order.shipping.first_name,
                last_name: order.shipping.last_name,
                address_1: order.shipping.address_1,
                address_2: order.shipping.address_2,
                city: order.shipping.city,
                postcode: order.shipping.postcode,
                country: order.shipping.country,
                state: order.shipping.state,
            },
            line_items: order.line_items.map((item: any) => ({
                id: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                total: item.total,
                sku: item.sku,
            })),
            shipping_lines: order.shipping_lines,
            payment_method: order.payment_method,
            payment_method_title: order.payment_method_title,
        });

    } catch (error) {
        console.error('Error fetching order:', error);
        return NextResponse.json(
            { error: 'Failed to fetch order details' },
            { status: 500 }
        );
    }
}
