import type { NextConfig } from "next";

/** @type {NextConfig} */
const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.run.app",
    "*.asia-east1.run.app",
    "ais-dev-4kyvfexzwxsk5gydbwi6ig-552577378870.asia-east1.run.app",
    "ais-pre-4kyvfexzwxsk5gydbwi6ig-552577378870.asia-east1.run.app",
  ],
  // Explicitly set the Turbopack workspace root
  turbopack: {
    root: process.cwd(),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
