import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["hugeicons-react", "@hugeicons/core-free-icons"],
  async rewrites() {
    return [
      {
        source: '/api/user/ai-keys/:path*',
        destination: 'http://localhost:5087/api/user/ai-keys/:path*',
      },
      {
        source: '/api/conductor/:path*',
        destination: 'http://localhost:5087/api/conductor/:path*',
      },
    ];
  },
};

export default nextConfig;