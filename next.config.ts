import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  distDir: "build",
  // Removing static export to allow client-side API calls
  // output: 'export',
  trailingSlash: true,
  experimental: {
    serverActions: {
      // Increase default 1MB limit to allow local video uploads via Server Actions
      bodySizeLimit: "200mb",
    },
    // @ts-ignore 
    middlewareClientMaxBodySize: "200mb",
  },
  // eslint: {
  //   // Ignore ESLint during production builds to avoid missing root config deps
  //   ignoreDuringBuilds: true,
  // },
  images: {
    // Enable Next.js image optimization for better performance
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Add async headers for CORS if needed
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*", // Allow all origins for cross-origin requests
          },
          {
            key: "Access-Control-Allow-Credentials",
            value: "true",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization, Cookie, X-Requested-With",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
