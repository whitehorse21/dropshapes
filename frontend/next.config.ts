import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Disable Turbopack to use Webpack instead (more stable)
  // Turbopack can cause compatibility issues with some packages

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
