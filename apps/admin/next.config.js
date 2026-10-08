const path = require('node:path');

// Set by the Dockerfile only. Standalone output bundles just the files the server needs;
// outputFileTracingRoot must be the monorepo root so workspace packages get traced too.
const standalone = process.env.NEXT_OUTPUT === 'standalone';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't let `next dev` generate AGENTS.md / CLAUDE.md when it detects an AI coding agent
  agentRules: false,
  transpilePackages: ['@sos-academy/shared'],
  ...(standalone && {
    output: 'standalone',
    outputFileTracingRoot: path.join(__dirname, '../../'),
  }),
};

module.exports = nextConfig;
