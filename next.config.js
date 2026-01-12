const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Performance optimizations
    compress: true,
    poweredByHeader: false,

    // SEO: Enforce no trailing slashes (prevents duplicate URLs)
    trailingSlash: false,
    skipTrailingSlashRedirect: false,

    // Optimize bundle
    compiler: {
        // Keep console.log for debugging, only remove console.error/warn in production
        removeConsole: false,
    },

    // Experimental optimizations
    experimental: {
        optimizePackageImports: ['lucide-react', 'date-fns'],
    },

    // Modern browser targets - reduces legacy JavaScript and polyfills
    transpilePackages: [],

    // Target modern browsers to reduce bundle size


    modularizeImports: {
        'lucide-react': {
            transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
        },
    },

    images: {
        unoptimized: true, // Disable Vercel image optimization to avoid 402 errors
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 31536000,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'crm.ideallivs.com',
                pathname: '/wp-content/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'ideallivs.com',
                pathname: '/wp-content/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'www.ideallivs.com',
                pathname: '/wp-content/uploads/**',
            },
        ],
    },
    async rewrites() {
        return [
            // Main sitemap index
            {
                source: '/sitemap.xml',
                destination: '/api/sitemap',
            },
            // Sub-sitemaps
            {
                source: '/sitemap-pages.xml',
                destination: '/api/sitemap/pages',
            },
            {
                source: '/sitemap-delivery.xml',
                destination: '/api/sitemap/delivery',
            },
            {
                source: '/sitemap-posts.xml',
                destination: '/api/sitemap/posts',
            },
            {
                source: '/sitemap-post-categories.xml',
                destination: '/api/sitemap/post-categories',
            },
            {
                source: '/sitemap-product-categories.xml',
                destination: '/api/sitemap/product-categories',
            },
            {
                source: '/sitemap-product-brands.xml',
                destination: '/api/sitemap/product-brands',
            },
            {
                source: '/sitemap-images.xml',
                destination: '/api/sitemap/images',
            },
            // Paginated product sitemaps
            {
                source: '/sitemap-products-:page.xml',
                destination: '/api/sitemap/products/:page',
            },
        ];
    },
};

module.exports = withNextIntl(nextConfig);
