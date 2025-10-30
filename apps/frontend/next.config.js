//@ts-check

const { composePlugins, withNx } = require('@nx/next');
const path = require('node:path');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  // Use this to set Nx-specific options
  // See: https://nx.dev/recipes/next/next-config-setup
  nx: {},
  // Config options from the original project
  /* config options here */
  reactStrictMode: true,

  // =====================================================
  // PERFORMANCE OPTIMIZATIONS FOR PRODUCTION DEPLOYMENT
  // =====================================================

  // Enable standalone output for optimal Docker deployment
  // This reduces bundle size by ~80% and memory usage significantly
  output: 'standalone',

  // Compiler optimizations
  compiler: {
    // Remove console logs in production for better performance
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // Image optimization configuration
  images: {
    // Enable image optimization
    formats: ['image/avif', 'image/webp'],
    // Minimize image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 60 days
    minimumCacheTTL: 60 * 60 * 24 * 60,
  },

  // Experimental optimizations (disabled until dependencies are resolved)
  // experimental: {
  //   optimizeCss: true,
  //   optimizeServerReact: true,
  // },

  // Skip trailing slash redirects for better compatibility
  skipTrailingSlashRedirect: true,

  // Production source maps (disabled for performance)
  productionBrowserSourceMaps: false,

  // Webpack optimizations
  webpack: (config, { dev }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
      '@/app': path.resolve(__dirname, 'app'),
    };

    // Production optimizations
    if (!dev) {
      // Minimize bundle size
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk for shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    return config;
  },

  // Add async headers for CORS and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // CORS headers
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
          // Performance & Security headers
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/static/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

const plugins = [
  // Add more Next.js plugins to this list if needed.
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
