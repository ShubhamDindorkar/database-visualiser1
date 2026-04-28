import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization and caching
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
    ],
    // Optimize images for faster loading
    formats: ['image/avif', 'image/webp'],
    // Cache optimized images
    minimumCacheTTL: 31536000, // 1 year
  },

  // Production source maps disabled for faster builds
  productionBrowserSourceMaps: false,

  // Optimize for Vercel Edge (faster deployments)
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: [
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      'lucide-react',
      'framer-motion',
    ],
  },
};

export default nextConfig;
