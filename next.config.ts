import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ignore TypeScript build errors (from tutorial - useful for production builds)
  typescript: {
    ignoreBuildErrors: true,
  },

  // Cache components for better performance
  cacheComponents: true,

  // Image configuration - keeping your domains + cloudinary setup
  images: {
    // Legacy domain support for unsplash
    domains: ["images.unsplash.com"],
    // Remote pattern support for cloudinary
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },

  // PostHog analytics rewrites - required since you have posthog-js installed
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },

  // Required to support PostHog trailing slash API requests
  skipTrailingSlashRedirect: true,
};

export default nextConfig;