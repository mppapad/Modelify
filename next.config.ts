import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   experimental: {
    serverComponentsExternalPackages: ["node-appwrite"],
  },
  // Increase API route body size limit
  api: {
    bodyParser: {
      sizeLimit: "100mb",
    },
  },
  // For handling large file uploads
  async rewrites() {
    return [];
  },
  // Webpack configuration
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  // Increase body size limit
  serverRuntimeConfig: {
    maxRequestSize: "100mb",
  };

module.exports = {
  images: {
    domains: ["api.qrserver.com"],
  },
},
};

export default nextConfig;
