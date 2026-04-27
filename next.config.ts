import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qdlgnhaekeehyn3h.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
