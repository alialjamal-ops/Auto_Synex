import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pin the workspace root: this project lives under a home directory that also
  // contains a stray package-lock.json, which otherwise confuses root inference.
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
};

export default nextConfig;
