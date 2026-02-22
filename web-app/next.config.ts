import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["hugeicons-react", "@hugeicons/core-free-icons"],
  // This reduces the indexing load on Turbopack significantly
};

export default nextConfig;