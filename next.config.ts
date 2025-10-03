import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["http://10.0.0.5"],
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;
