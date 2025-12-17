'use server';

import { getWooCommerceUrl, getWooCommerceAuthHeader } from '@/lib/woocommerce/config';

export async function testWooCommerceConnection() {
    const results: any = {
        config: {
            wordpressUrl: process.env.NEXT_PUBLIC_WORDPRESS_URL || 'NOT SET',
            apiUrl: '',
            hasConsumerKey: !!process.env.WORDPRESS_CONSUMER_KEY,
            hasConsumerSecret: !!process.env.WORDPRESS_CONSUMER_SECRET,
        },
        public: { success: false, message: '' },
        auth: { success: false, message: '', responseText: '' },
        zones: { success: false, data: null, error: '', responseText: '' },
        gateways: { success: false, data: null, error: '', responseText: '' },
    };

    try {
        results.config.apiUrl = getWooCommerceUrl('/');
    } catch (e: any) {
        results.config.error = e.message;
        return results;
    }

    // Test 1: Public access (Index)
    try {
        const publicUrl = getWooCommerceUrl('/');
        const res = await fetch(publicUrl, { cache: 'no-store' });
        if (res.ok) {
            results.public.success = true;
            results.public.message = `Access OK: ${res.status}`;
        } else {
            results.public.message = `Failed: ${res.status} ${res.statusText}`;
            results.public.responseText = await res.text();
        }
    } catch (e: any) {
        results.public.message = `Error: ${e.message}`;
    }

    // Test 2: Authenticated access (Settings)
    try {
        const authUrl = getWooCommerceUrl('/settings/general');
        const res = await fetch(authUrl, {
            headers: { 'Authorization': getWooCommerceAuthHeader() },
            cache: 'no-store'
        });
        const responseText = await res.text();
        results.auth.responseText = responseText.substring(0, 500);

        if (res.ok) {
            results.auth.success = true;
            results.auth.message = `Auth OK: ${res.status}`;
            try {
                results.auth.data = JSON.parse(responseText);
            } catch {
                results.auth.message += ' (Response is not JSON)';
            }
        } else {
            results.auth.message = `Failed: ${res.status} ${res.statusText}`;
        }
    } catch (e: any) {
        results.auth.message = `Error: ${e.message}`;
    }

    // Test 3: Shipping Zones
    try {
        const zonesUrl = getWooCommerceUrl('/shipping/zones');
        const res = await fetch(zonesUrl, {
            headers: { 'Authorization': getWooCommerceAuthHeader() },
            cache: 'no-store'
        });
        const responseText = await res.text();
        results.zones.responseText = responseText.substring(0, 500);

        if (res.ok) {
            try {
                const data = JSON.parse(responseText);
                results.zones.success = true;
                results.zones.data = data;

                // Sub-test: Check methods for first zone if exists
                if (data.length > 0) {
                    const zoneId = data[0].id;
                    const methodsUrl = getWooCommerceUrl(`/shipping/zones/${zoneId}/methods`);
                    const mRes = await fetch(methodsUrl, {
                        headers: { 'Authorization': getWooCommerceAuthHeader() },
                        cache: 'no-store'
                    });
                    const methodsText = await mRes.text();
                    if (mRes.ok) {
                        try {
                            results.zones.firstZoneMethods = JSON.parse(methodsText);
                        } catch {
                            results.zones.firstZoneError = 'Methods response is not JSON';
                            results.zones.methodsResponseText = methodsText.substring(0, 300);
                        }
                    } else {
                        results.zones.firstZoneError = `Failed to get methods for zone ${zoneId}: ${mRes.status}`;
                        results.zones.methodsResponseText = methodsText.substring(0, 300);
                    }
                }
            } catch {
                results.zones.error = 'Response is not JSON';
            }
        } else {
            results.zones.error = `Failed: ${res.status} ${res.statusText}`;
        }
    } catch (e: any) {
        results.zones.error = `Error: ${e.message}`;
    }

    // Test 4: Payment Gateways
    try {
        const gatewaysUrl = getWooCommerceUrl('/payment_gateways');
        const res = await fetch(gatewaysUrl, {
            headers: { 'Authorization': getWooCommerceAuthHeader() },
            cache: 'no-store'
        });
        const responseText = await res.text();
        results.gateways.responseText = responseText.substring(0, 500);

        if (res.ok) {
            try {
                const data = JSON.parse(responseText);
                results.gateways.success = true;
                results.gateways.data = data;
            } catch {
                results.gateways.error = 'Response is not JSON';
            }
        } else {
            results.gateways.error = `Failed: ${res.status} ${res.statusText}`;
        }
    } catch (e: any) {
        results.gateways.error = `Error: ${e.message}`;
    }

    return results;
}
