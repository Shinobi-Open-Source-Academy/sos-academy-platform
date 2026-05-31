/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@sos-academy/shared'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
};

module.exports = nextConfig;
