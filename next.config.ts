import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Use Turbopack for faster builds (Next.js 16 default)
  turbopack: {},
  
  // Webpack configuration for pdf-parse compatibility (fallback)
  webpack: (config: any) => {
    // Prevent canvas module errors (pdf-parse optional dependency)
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
