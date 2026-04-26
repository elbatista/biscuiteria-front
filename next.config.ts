import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  /* config options here */
  images: {
    // unoptimized: process.env.NODE_ENV === "development",

    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      {
        protocol: "https",
        hostname: "qdlgnhaekeehyn3h.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
