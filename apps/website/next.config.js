const path = require('node:path');

// Set by the Dockerfile only. Standalone output bundles just the files the server needs;
// outputFileTracingRoot must be the monorepo root so workspace packages get traced too.
const standalone = process.env.NEXT_OUTPUT === 'standalone';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@sos-academy/shared', '@sos-academy/ui'],
  ...(standalone && {
    output: 'standalone',
    outputFileTracingRoot: path.join(__dirname, '../../'),
  }),
  async redirects() {
    return [
      {
        source: '/blog',
        destination: process.env.NEXT_PUBLIC_BLOG_URL || 'https://blog.shinobi-open-source.academy',
        permanent: false,
      },
      {
        source: '/blog/:path*',
        destination: `${process.env.NEXT_PUBLIC_BLOG_URL || 'https://blog.shinobi-open-source.academy'}/:path*`,
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
