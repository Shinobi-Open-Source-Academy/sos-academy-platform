/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't let `next dev` generate AGENTS.md / CLAUDE.md when it detects an AI coding agent
  agentRules: false,
  transpilePackages: ['@sos-academy/shared'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
    ],
  },
};

module.exports = nextConfig;
