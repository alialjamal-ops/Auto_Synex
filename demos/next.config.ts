import path from 'node:path';
import type { NextConfig } from 'next';

/**
 * Mounting point.
 *
 * The demos are designed to live under the main Auto Synex site at
 * `autosynex.com/demos`, proxied there by the main project's `vercel.json`.
 * Setting `NEXT_PUBLIC_BASE_PATH=/demos` makes Next prefix every route, asset
 * and link automatically, so the two origins stay in step. Leave it unset to
 * run the demos standalone at the root.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/$/, '') || undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath,
  // Assets must resolve against the demos origin even when the HTML is served
  // from the parent domain through a rewrite.
  assetPrefix: process.env.NEXT_PUBLIC_ASSET_PREFIX || undefined,
  // Pin the workspace root: this project lives inside a repository that also
  // holds the main site, so root inference needs help.
  turbopack: { root: path.join(__dirname) },
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // All demo photography is self-hosted under `public/media` (see
    // config/media.ts). Add `remotePatterns` here if a client's CDN is wired in.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 828, 1080, 1200, 1600, 1920],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // When mounted under a base path, the bare origin would otherwise 404.
  async redirects() {
    if (!basePath) return [];
    return [{ source: '/', destination: basePath, basePath: false, permanent: false }];
  },
};

export default nextConfig;
