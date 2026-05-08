import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep @remotion/renderer and bundler on Node.js runtime only
  serverExternalPackages: [
    '@remotion/renderer',
    '@remotion/bundler',
    'puppeteer-core',
    '@puppeteer/browsers',
  ],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
};

export default nextConfig;
