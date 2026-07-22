import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    deviceSizes: [640, 750, 828, 1080, 1200],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 86400,
  },
};

export default nextConfig;
