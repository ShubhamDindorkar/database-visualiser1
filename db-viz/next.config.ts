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

  // Enable SWC minification (faster than Terser)
  swcMinify: true,

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

  // Webpack configuration for optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize client-side bundle
      config.optimization = {
        ...config.optimization,
        runtimeChunk: 'single',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk
            vendor: {
              filename: 'chunks/vendor.js',
              test: /node_modules/,
              priority: 10,
              reuseExistingChunk: true,
              name: 'vendor',
            },
            // Common chunk
            common: {
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
              name: 'common',
            },
            // Firebase chunk
            firebase: {
              test: /[\\/]node_modules[\\/]firebase/,
              filename: 'chunks/firebase.js',
              priority: 15,
              reuseExistingChunk: true,
              name: 'firebase',
            },
            // React Flow chunk
            reactflow: {
              test: /[\\/]node_modules[\\/]react(flow)?/,
              filename: 'chunks/reactflow.js',
              priority: 14,
              reuseExistingChunk: true,
              name: 'reactflow',
            },
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
