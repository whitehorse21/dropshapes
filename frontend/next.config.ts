import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Next.js 16 uses Turbopack by default for builds; empty config silences
  // "webpack config but no turbopack config" error. Use `next build --webpack` to use webpack.
  turbopack: {},

  // React 19 + Next.js 16 compatibility settings
  reactStrictMode: true,

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },

  // TypeScript settings
  typescript: {
    ignoreBuildErrors: false,
  },

  // Fix for Next.js 16 connection and build issues
  webpack: (config, { isServer }) => {
    // Ensure proper handling of client/server code
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default nextConfig;
