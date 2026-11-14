import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The parent repository has its own lockfile; pin the workspace root to this app.
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
