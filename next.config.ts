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
};
module.exports = {
  images: {
    domains: ["api.qrserver.com"],
  },
};

export default nextConfig;
