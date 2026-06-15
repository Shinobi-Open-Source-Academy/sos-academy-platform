/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@sos-academy/shared', '@sos-academy/ui'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

module.exports = nextConfig;
