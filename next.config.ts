import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image domains configuration
  images: {
    domains: ["api.qrserver.com"],
  },

  // Headers for CORS and file uploads
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          // Increase timeout for large uploads
          {
            key: "Keep-Alive",
            value: "timeout=30, max=1000",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
