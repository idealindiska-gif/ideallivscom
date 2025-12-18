/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'crm.ideallivs.com',
                pathname: '/wp-content/uploads/**',
            },
        ],
    },
};

module.exports = nextConfig;
