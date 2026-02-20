import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // unoptimized: process.env.NODE_ENV === "development",

    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      
    ],
  },
};

export default nextConfig;
