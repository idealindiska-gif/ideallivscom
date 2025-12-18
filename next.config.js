/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        unoptimized: true,
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
            {
                source: '/sitemap-products-:page.xml',
                destination: '/sitemap-products/:page',
            },
        ];
    },
};

module.exports = nextConfig;
