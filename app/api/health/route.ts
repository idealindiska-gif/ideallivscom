import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 *
 * This endpoint is used by monitoring services to check if the application is running.
 * It also verifies connectivity to WordPress/WooCommerce backend.
 *
 * @returns JSON response with health status
 */
export async function GET() {
  const healthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    checks: {
      nextjs: true,
      wordpress: false,
      woocommerce: false,
    },
    version: process.env.npm_package_version || '1.0.0',
  };

  try {
    // Check WordPress connectivity
    const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
    if (wpUrl) {
      const wpResponse = await fetch(`${wpUrl}/wp-json/wp/v2/posts?per_page=1`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      });

      healthCheck.checks.wordpress = wpResponse.ok;
    }

    // Check WooCommerce connectivity
    const wcConsumerKey = process.env.WORDPRESS_CONSUMER_KEY;
    const wcConsumerSecret = process.env.WORDPRESS_CONSUMER_SECRET;

    if (wpUrl && wcConsumerKey && wcConsumerSecret) {
      const wcResponse = await fetch(
        `${wpUrl}/wp-json/wc/v3/products?per_page=1`,
        {
          method: 'GET',
          headers: {
            Authorization: `Basic ${Buffer.from(`${wcConsumerKey}:${wcConsumerSecret}`).toString('base64')}`,
          },
          next: { revalidate: 60 }, // Cache for 1 minute
        }
      );

      healthCheck.checks.woocommerce = wcResponse.ok;
    }

    // Determine overall health status
    const allChecksPass = Object.values(healthCheck.checks).every(check => check === true);
    healthCheck.status = allChecksPass ? 'healthy' : 'degraded';

    return NextResponse.json(healthCheck, {
      status: allChecksPass ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        checks: healthCheck.checks,
      },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}

// Allow health checks without authentication
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
