import type { NextConfig } from "next";

/** @type {NextConfig} */
const nextConfig: NextConfig = {
  // Explicitly set the Turbopack workspace root
  turbopack: {
    root: process.cwd(),
  },
  // add other Next.js options as needed
};

export default nextConfig;
