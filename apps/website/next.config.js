/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@sos-academy/shared', '@sos-academy/ui'],
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
