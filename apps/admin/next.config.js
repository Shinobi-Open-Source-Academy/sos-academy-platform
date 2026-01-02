/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@sos-academy/shared'],
};

module.exports = nextConfig;
