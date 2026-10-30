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
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

module.exports = nextConfig;
