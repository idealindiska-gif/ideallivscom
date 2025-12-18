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
        ],
    },
};

module.exports = nextConfig;
