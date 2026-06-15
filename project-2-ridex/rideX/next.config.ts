import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ← this skips ALL eslint errors during build
  },
};

export default nextConfig;
