import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    qualities: [75, 85],
    remotePatterns: [
      { protocol: "https", hostname: "www.centuryply.com", pathname: "/uploads/**" },
      { protocol: "https", hostname: "www.greenply.com", pathname: "/assets/images/**" },
      { protocol: "https", hostname: "toolswarehouse.in", pathname: "/cdn/shop/collections/**" },
      { protocol: "https", hostname: "home.hafeleindia.com", pathname: "/cdn/shop/files/**" },
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/wikipedia/commons/**" },
      { protocol: "https", hostname: "3adeal.com", pathname: "/images/thumbnails/**" },
      { protocol: "https", hostname: "images.assettype.com", pathname: "/fortune-india/import/company/logos/**" },
      { protocol: "https", hostname: "online.fliphtml5.com", pathname: "/ajyyd/**" },
    ],
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
