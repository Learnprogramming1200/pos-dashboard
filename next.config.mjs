/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: ".next",
  trailingSlash: false,
  images: {
    unoptimized: false,
    remotePatterns: [{ protocol: "https", hostname: "*", pathname: "/**" }],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '200mb',
    },
    // CHANGED: Renamed from middlewareClientMaxBodySize
    proxyClientMaxBodySize: '200mb',
  },
};

export default nextConfig;