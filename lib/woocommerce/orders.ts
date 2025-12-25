import { Order, BillingAddress, ShippingAddress, LineItem } from '@/types/woocommerce';
import { WC_API_CONFIG, getWooCommerceUrl, getWooCommerceAuthHeader } from './config';

/**
 * Safely parse JSON response, detecting HTML error pages and PHP warnings
 */
async function parseJsonResponse(response: Response): Promise<any> {
    let text = await response.text();

    // Strip PHP warnings/errors that appear before JSON (e.g., <br /><b>Warning</b>...)
    // This happens when WordPress has WP_DEBUG enabled
    const jsonStart = text.search(/^[\[\{]/m);
    if (jsonStart > 0 && text.substring(0, jsonStart).includes('<b>')) {
        console.warn('PHP warnings detected in response, stripping them:', text.substring(0, Math.min(jsonStart, 200)));
        text = text.substring(jsonStart);
    }

    // Check if response is HTML (error page)
    if (text.trim().startsWith('<') || text.includes('<!DOCTYPE')) {
        console.error('Received HTML instead of JSON:', text.substring(0, 200));
        throw new Error(
            `WooCommerce API returned HTML instead of JSON. Status: ${response.status}. ` +
            'This usually means: 1) Invalid API credentials, 2) WordPress REST API is disabled, ' +
            'or 3) Wrong API URL. Check your .env file and WordPress settings.'
        );
    }

    try {
        return JSON.parse(text);
    } catch (e) {
        console.error('Failed to parse response:', text.substring(0, 200));
        throw new Error(`Invalid JSON response from WooCommerce API: ${text.substring(0, 100)}`);
    }
}

export interface CreateOrderData {
    customer_id?: number;  // Link order to WooCommerce customer
    billing: BillingAddress;
    shipping: ShippingAddress;
    line_items: {
        product_id: number;
        variation_id?: number;
        quantity: number;
    }[];
    shipping_lines?: {
        method_id: string;
        method_title: string;
        total: string;
    }[];
    payment_method?: string;
    payment_method_title?: string;
    customer_note?: string;
    set_paid?: boolean;
    transaction_id?: string;
    coupon_lines?: {
        code: string;
    }[];
}

/**
 * Create a new order in WooCommerce
 */
export async function createOrder(orderData: CreateOrderData): Promise<Order> {
    const response = await fetch(getWooCommerceUrl('/orders'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getWooCommerceAuthHeader(),
        },
        body: JSON.stringify(orderData),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
    }

    return parseJsonResponse(response);
}

/**
 * Get order by ID
 */
export async function getOrder(orderId: number): Promise<Order> {
    const response = await fetch(getWooCommerceUrl(`/orders/${orderId}`), {
        headers: {
            'Authorization': getWooCommerceAuthHeader(),
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch order');
    }

    return parseJsonResponse(response);
}

/**
 * Validate cart items against current stock
 */
export async function validateCartStock(items: { productId: number; quantity: number }[]): Promise<{
    valid: boolean;
    errors: { productId: number; message: string }[];
}> {
    const errors: { productId: number; message: string }[] = [];

    for (const item of items) {
        try {
            const response = await fetch(
                getWooCommerceUrl(`/products/${item.productId}`),
                {
                    headers: {
                        'Authorization': getWooCommerceAuthHeader(),
                    },
                    cache: 'no-store',
                }
            );

            if (!response.ok) {
                errors.push({
                    productId: item.productId,
                    message: 'Product not found',
                });
                continue;
            }

            const product = await parseJsonResponse(response);

            // Check stock status
            if (product.stock_status === 'outofstock') {
                errors.push({
                    productId: item.productId,
                    message: 'Product is out of stock',
                });
                continue;
            }

            // Check stock quantity if managed
            if (product.manage_stock && product.stock_quantity !== null) {
                if (product.stock_quantity < item.quantity) {
                    errors.push({
                        productId: item.productId,
                        message: `Only ${product.stock_quantity} items available`,
                    });
                }
            }
        } catch (error) {
            errors.push({
                productId: item.productId,
                message: 'Failed to validate stock',
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Get available payment gateways
 */
export async function getPaymentGateways() {
    const response = await fetch(getWooCommerceUrl('/payment_gateways'), {
        headers: {
            'Authorization': getWooCommerceAuthHeader(),
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
        throw new Error('Failed to fetch payment gateways');
    }

    return parseJsonResponse(response);
}

/**
 * Get available shipping methods
 */
export async function getShippingMethods() {
    const response = await fetch(getWooCommerceUrl('/shipping/zones'), {
        headers: {
            'Authorization': getWooCommerceAuthHeader(),
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
        throw new Error('Failed to fetch shipping zones');
    }

    return parseJsonResponse(response);
}

/**
 * Get coupon by code
 */
export async function getCoupon(code: string) {
    const response = await fetch(getWooCommerceUrl(`/coupons?code=${code}`), {
        headers: {
            'Authorization': getWooCommerceAuthHeader(),
        },
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch coupon');
    }

    const coupons = await parseJsonResponse(response);
    return coupons.length > 0 ? coupons[0] : null;
}

/**
 * Get orders for a specific customer
 */
export async function getCustomerOrders(customerId: number, params?: {
    per_page?: number;
    page?: number;
    status?: string;
}): Promise<Order[]> {
    const queryParams = new URLSearchParams({
        customer: customerId.toString(),
        per_page: params?.per_page?.toString() || '10',
        page: params?.page?.toString() || '1',
        ...(params?.status && { status: params.status }),
    });

    const response = await fetch(
        getWooCommerceUrl(`/orders?${queryParams.toString()}`),
        {
            headers: {
                'Authorization': getWooCommerceAuthHeader(),
            },
            cache: 'no-store',
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch customer orders');
    }

    return parseJsonResponse(response);
}

/**
 * Get shipping zones with their locations (postcodes, regions, etc.)
 */
export async function getShippingZones() {
    const response = await fetch(getWooCommerceUrl('/shipping/zones'), {
        headers: {
            'Authorization': getWooCommerceAuthHeader(),
        },
        next: { revalidate: 3600 },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch shipping zones');
    }

    return parseJsonResponse(response);
}

/**
 * Get locations (postcodes/regions) for a specific shipping zone
 */
export async function getShippingZoneLocations(zoneId: number) {
    const response = await fetch(
        getWooCommerceUrl(`/shipping/zones/${zoneId}/locations`),
        {
            headers: {
                'Authorization': getWooCommerceAuthHeader(),
            },
            next: { revalidate: 3600 },
        }
    );

    if (!response.ok) {
        throw new Error('Failed to fetch shipping zone locations');
    }

    return parseJsonResponse(response);
}

/**
 * Validate if a postcode is in any shipping zone
 * WooCommerce zones can be configured by: country, state, postcode, or postcode ranges
 */
export async function validateShippingPostcode(postcode: string, country: string = 'SE'): Promise<{
    valid: boolean;
    zoneId?: number;
    zoneName?: string;
    error?: string;
}> {
    try {
        // Get all shipping zones
        const zones = await getShippingZones();

        // Normalize the postcode
        const normalizedPostcode = postcode.replace(/\s/g, '').toUpperCase();
        const normalizedCountry = country.toUpperCase();

        // Track the best matching zone (most specific wins)
        let bestMatch: { zoneId: number; zoneName: string; priority: number } | null = null;

        // Check each zone for matching location
        for (const zone of zones) {
            // Skip zone 0 (fallback zone) in the first pass
            if (zone.id === 0) continue;

            const locations = await getShippingZoneLocations(zone.id);

            // If zone has no locations, skip it
            if (!locations || locations.length === 0) continue;

            for (const location of locations) {
                let matched = false;
                let priority = 0;

                switch (location.type) {
                    case 'postcode':
                        // Handle postcode matching (most specific - priority 3)
                        const locationCode = location.code.replace(/\s/g, '').toUpperCase();

                        // Handle ranges like "111...115" or "111-115"
                        if (locationCode.includes('...') || locationCode.includes('-')) {
                            const delimiter = locationCode.includes('...') ? '...' : '-';
                            const [start, end] = locationCode.split(delimiter);
                            const postcodeNum = parseInt(normalizedPostcode, 10);
                            const startNum = parseInt(start, 10);
                            const endNum = parseInt(end, 10);

                            if (!isNaN(postcodeNum) && !isNaN(startNum) && !isNaN(endNum)) {
                                matched = postcodeNum >= startNum && postcodeNum <= endNum;
                                priority = 3;
                            }
                        }
                        // Handle wildcard postcodes (e.g., "123*")
                        else if (locationCode.includes('*')) {
                            const pattern = locationCode.replace(/\*/g, '.*');
                            const regex = new RegExp(`^${pattern}$`);
                            matched = regex.test(normalizedPostcode);
                            priority = 3;
                        }
                        // Exact match
                        else {
                            matched = locationCode === normalizedPostcode;
                            priority = 3;
                        }
                        break;

                    case 'state':
                        // State matching (priority 2) - would need state info
                        // For now, skip state matching as we only have postcode
                        break;

                    case 'country':
                        // Country matching (priority 1)
                        matched = location.code.toUpperCase() === normalizedCountry;
                        priority = 1;
                        break;

                    case 'continent':
                        // Continent matching (priority 0)
                        // Would need continent mapping, skip for now
                        break;
                }

                if (matched && (!bestMatch || priority > bestMatch.priority)) {
                    bestMatch = {
                        zoneId: zone.id,
                        zoneName: zone.name,
                        priority
                    };
                }
            }
        }

        // If we found a match, return it
        if (bestMatch) {
            return {
                valid: true,
                zoneId: bestMatch.zoneId,
                zoneName: bestMatch.zoneName,
            };
        }

        // Fallback to zone 0 ("Locations not covered by your other zones")
        // This is WooCommerce's default catch-all zone
        const fallbackZone = zones.find((z: any) => z.id === 0);
        if (fallbackZone) {
            return {
                valid: true,
                zoneId: 0,
                zoneName: fallbackZone.name || 'Default Zone',
            };
        }

        return {
            valid: false,
            error: 'Postcode is not in any available shipping zone',
        };
    } catch (error) {
        console.error('Error validating shipping postcode:', error);
        return {
            valid: false,
            error: 'Failed to validate shipping postcode',
        };
    }
}

/**
 * Extract Stripe PaymentIntent client_secret from order metadata
 * WooCommerce Stripe plugin stores this in order meta
 */
export function getStripeClientSecret(order: Order): string | null {
    if (!order.meta_data || order.meta_data.length === 0) {
        return null;
    }

    // Look for Stripe client_secret in meta_data
    // Common keys: _stripe_intent_id, _stripe_source_id, or custom meta
    const stripeIntentMeta = order.meta_data.find(
        (meta) => meta.key === '_stripe_intent_id' || meta.key === 'stripe_intent_id'
    );

    if (stripeIntentMeta && typeof stripeIntentMeta.value === 'string') {
        // If we have the intent ID, we need to construct or fetch the client_secret
        // Note: This might require a custom WP endpoint if WooCommerce doesn't expose it
        return stripeIntentMeta.value as string;
    }

    // Alternative: Look for client_secret directly
    const clientSecretMeta = order.meta_data.find(
        (meta) => meta.key === '_stripe_client_secret' || meta.key === 'stripe_client_secret'
    );

    if (clientSecretMeta && typeof clientSecretMeta.value === 'string') {
        return clientSecretMeta.value as string;
    }

    return null;
}

