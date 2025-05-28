import type { NextConfig } from "next";

const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["node-appwrite"],
  },
  // Increase API route body size limit
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
  // Image domains configuration
  images: {
    domains: ["api.qrserver.com"],
  },
  // For handling large file uploads
  async rewrites() {
    return [];
  },
  // Webpack configuration
  webpack: (config: any) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  // Increase body size limit
  serverRuntimeConfig: {
    maxRequestSize: "100mb",
  },
};

module.exports = nextConfig;
