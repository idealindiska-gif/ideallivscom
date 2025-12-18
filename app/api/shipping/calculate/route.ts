import { NextRequest, NextResponse } from 'next/server';

const WP_API_BASE = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://crm.ideallivs.com/wp-json';
const MCP_KEY = process.env.FOURLINES_MCP_KEY;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, postcode, city, country } = body;

    if (process.env.NODE_ENV === 'development') {
      console.log('📍 [API Route] Shipping calculation request:', {
        items,
        postcode,
        city,
        country,
      });
    }

    if (!MCP_KEY) {
      console.error('❌ [API Route] Missing MCP API key');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Call WordPress MCP API
    const response = await fetch(
      `${WP_API_BASE}/fourlines-mcp/v1/shipping/calculate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Fourlines-Key': MCP_KEY,
        },
        body: JSON.stringify({
          items: items.map((item: any) => ({
            product_id: item.productId,
            variation_id: item.variationId,
            quantity: item.quantity,
          })),
          postcode,
          city,
          country,
        }),
      }
    );

    if (process.env.NODE_ENV === 'development') {
      console.log('📍 [API Route] WordPress response status:', response.status);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API Route] WordPress API error:', errorText);
      return NextResponse.json(
        { error: 'Failed to calculate shipping', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [API Route] WordPress response data:', data);
    }

    // Transform response to match expected format
    return NextResponse.json({
      success: true,
      available_methods: data.available_methods || [],
      restricted_products: data.restricted_products || [],
      cart_subtotal: data.cart_total || 0,
      free_shipping_threshold: 500,
      amount_to_free_shipping: Math.max(0, 500 - (data.cart_total || 0)),
      minimum_order: 300,
      minimum_order_met: (data.cart_total || 0) >= 300,
    });
  } catch (error) {
    console.error('❌ [API Route] Error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
