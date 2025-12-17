'use server';

import { validateCartStock } from '@/lib/woocommerce/orders';

export async function validateCartStockAction(items: { productId: number; quantity: number }[]) {
    console.log('🔍 validateCartStockAction - Checking env vars:', {
        hasWcKey: !!process.env.WORDPRESS_CONSUMER_KEY,
        hasWcSecret: !!process.env.WORDPRESS_CONSUMER_SECRET,
        nodeEnv: process.env.NODE_ENV
    });

    try {
        const result = await validateCartStock(items);
        return { success: true, data: result };
    } catch (error: any) {
        console.error('Stock validation error:', error);
        return { success: false, error: error.message || 'Failed to validate stock' };
    }
}
