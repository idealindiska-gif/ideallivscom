/**
 * Test endpoint to directly check WooCommerce API connectivity
 * Access: /api/test-wc-customer?email=test@test.com
 */

import { WC_API_CONFIG } from '@/lib/woocommerce/config';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
        return Response.json({ error: 'Email parameter required' }, { status: 400 });
    }

    const baseUrl = WC_API_CONFIG.baseUrl;
    const consumerKey = process.env.WORDPRESS_CONSUMER_KEY;
    const consumerSecret = process.env.WORDPRESS_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
        return Response.json({
            error: 'Missing WooCommerce API credentials',
            hasKey: !!consumerKey,
            hasSecret: !!consumerSecret
        }, { status: 500 });
    }

    try {
        const customerUrl = `${baseUrl}/customers?email=${encodeURIComponent(email)}`;

        console.log('🧪 TEST: Fetching from:', customerUrl);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const startTime = Date.now();

        const response = await fetch(customerUrl, {
            headers: {
                'Authorization': 'Basic ' + Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64'),
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - startTime;

        console.log('🧪 TEST: Response status:', response.status);
        console.log('🧪 TEST: Duration:', duration, 'ms');

        if (response.ok) {
            const customers = await response.json();
            return Response.json({
                success: true,
                duration: `${duration}ms`,
                status: response.status,
                found: customers.length > 0,
                customerId: customers.length > 0 ? customers[0].id : null,
                customerData: customers.length > 0 ? {
                    id: customers[0].id,
                    email: customers[0].email,
                    first_name: customers[0].first_name,
                    last_name: customers[0].last_name,
                } : null,
            });
        } else {
            const errorText = await response.text();
            return Response.json({
                success: false,
                duration: `${duration}ms`,
                status: response.status,
                error: errorText,
            }, { status: response.status });
        }

    } catch (error: any) {
        console.error('🧪 TEST ERROR:', error);

        return Response.json({
            success: false,
            error: error.message,
            errorType: error.name,
            errorCause: error.cause ? String(error.cause) : null,
            isAbortError: error.name === 'AbortError',
            isNetworkError: error.message?.includes('fetch failed'),
        }, { status: 500 });
    }
}
