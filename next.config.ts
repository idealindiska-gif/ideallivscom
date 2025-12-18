import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "crm.ideallivs.com",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "ideallivs.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
