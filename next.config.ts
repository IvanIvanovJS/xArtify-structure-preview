import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Добави тези настройки за hot reload
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com"
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com"
      },
    ],
  },
};

export default nextConfig;