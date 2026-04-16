import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel uses its own build system — do NOT use output: "standalone"
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
};

export default nextConfig;
